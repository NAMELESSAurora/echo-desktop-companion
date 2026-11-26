import asyncio
import json
import uuid
from pathlib import Path

import aiosqlite

from companion.models import FactCandidate, SessionCreate, utcnow


class StaleMemory(Exception):
    pass


class Store:
    def __init__(self, path: Path):
        self.path = path
        self.lock = asyncio.Lock()

    async def start(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.db = await aiosqlite.connect(self.path)
        self.db.row_factory = aiosqlite.Row
        await self.db.executescript("""
            PRAGMA journal_mode=WAL;
            PRAGMA foreign_keys=ON;
            PRAGMA busy_timeout=5000;
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY, character_id TEXT NOT NULL, system_prompt TEXT NOT NULL,
                created_at TEXT NOT NULL, screen_enabled INTEGER NOT NULL DEFAULT 0,
                screen_source TEXT, screen_epoch INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS turns (
                id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id),
                request_id TEXT NOT NULL, request_hash TEXT NOT NULL, status TEXT NOT NULL,
                has_image INTEGER NOT NULL, created_at TEXT NOT NULL, finished_at TEXT,
                error_code TEXT, metrics TEXT NOT NULL DEFAULT '{}',
                UNIQUE(session_id, request_id)
            );
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL REFERENCES sessions(id),
                turn_id TEXT NOT NULL REFERENCES turns(id), role TEXT NOT NULL, text TEXT NOT NULL,
                created_at TEXT NOT NULL, context_allowed INTEGER NOT NULL DEFAULT 1
            );
            CREATE INDEX IF NOT EXISTS messages_session ON messages(session_id, id);
            CREATE TABLE IF NOT EXISTS memory_state (
                character_id TEXT PRIMARY KEY, epoch INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS memory_jobs (
                id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id),
                character_id TEXT NOT NULL, epoch INTEGER NOT NULL, status TEXT NOT NULL,
                created_at TEXT NOT NULL, finished_at TEXT, error_code TEXT,
                proposal_count INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS proposals (
                id TEXT PRIMARY KEY, job_id TEXT NOT NULL REFERENCES memory_jobs(id),
                character_id TEXT NOT NULL, epoch INTEGER NOT NULL, text TEXT NOT NULL,
                source_ids TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending'
            );
            CREATE TABLE IF NOT EXISTS facts (
                id TEXT PRIMARY KEY, character_id TEXT NOT NULL, text TEXT NOT NULL,
                source_ids TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                UNIQUE(character_id, text)
            );
        """)
        now = utcnow()
        await self.db.execute(
            "UPDATE turns SET status='interrupted', error_code='server_restarted', finished_at=? "
            "WHERE status IN ('queued','running')",
            (now,),
        )
        await self.db.execute(
            "UPDATE memory_jobs SET status='interrupted', error_code='server_restarted', "
            "finished_at=? WHERE status IN ('queued','running')",
            (now,),
        )
        # A restart never restores a permission to view the user's screen.
        await self.db.execute(
            "UPDATE sessions SET screen_enabled=0, screen_source=NULL, screen_epoch=screen_epoch+1"
        )
        await self.db.commit()

    async def close(self):
        await self.db.close()

    async def _one(self, sql, values=()):
        async with self.db.execute(sql, values) as cur:
            row = await cur.fetchone()
        return dict(row) if row else None

    async def _all(self, sql, values=()):
        async with self.db.execute(sql, values) as cur:
            rows = await cur.fetchall()
        return [dict(r) for r in rows]

    async def create_session(self, data: SessionCreate):
        sid = uuid.uuid4().hex
        async with self.lock:
            await self.db.execute(
                "INSERT INTO sessions(id,character_id,system_prompt,created_at) VALUES(?,?,?,?)",
                (sid, data.character_id, data.system_prompt, utcnow()),
            )
            await self.db.execute(
                "INSERT OR IGNORE INTO memory_state(character_id) VALUES(?)", (data.character_id,)
            )
            await self.db.commit()
            return await self._one("SELECT * FROM sessions WHERE id=?", (sid,))

    async def session(self, sid):
        async with self.lock:
            return await self._one("SELECT * FROM sessions WHERE id=?", (sid,))

    async def screen_policy(self, sid, enabled, source_id):
        async with self.lock:
            await self.db.execute(
                "UPDATE sessions SET screen_enabled=?,screen_source=?,screen_epoch=screen_epoch+1 "
                "WHERE id=?",
                (int(enabled), source_id if enabled else None, sid),
            )
            await self.db.commit()
            return await self._one("SELECT * FROM sessions WHERE id=?", (sid,))

    async def existing_turn(self, sid, request_id):
        async with self.lock:
            return await self._one(
                "SELECT * FROM turns WHERE session_id=? AND request_id=?", (sid, request_id)
            )

    async def create_turn(self, tid, sid, request_id, request_hash, has_image):
        async with self.lock:
            await self.db.execute(
                "INSERT INTO turns"
                "(id,session_id,request_id,request_hash,status,has_image,created_at) "
                "VALUES(?,?,?,?,'queued',?,?)",
                (tid, sid, request_id, request_hash, int(has_image), utcnow()),
            )
            await self.db.commit()

    async def running(self, tid):
        async with self.lock:
            await self.db.execute("UPDATE turns SET status='running' WHERE id=?", (tid,))
            await self.db.commit()

    async def finish(self, tid, status, metrics, error_code=None, messages=None):
        async with self.lock:
            try:
                turn = await self._one("SELECT * FROM turns WHERE id=?", (tid,))
                if not turn or turn["status"] not in ("queued", "running"):
                    return
                now = utcnow()
                if messages and not turn["has_image"] and status == "completed":
                    for role, text in messages:
                        await self.db.execute(
                            "INSERT INTO messages(session_id,turn_id,role,text,created_at) "
                            "VALUES(?,?,?,?,?)",
                            (turn["session_id"], tid, role, text, now),
                        )
                await self.db.execute(
                    "UPDATE turns SET status=?,finished_at=?,error_code=?,metrics=? WHERE id=?",
                    (status, now, error_code, json.dumps(metrics), tid),
                )
                await self.db.commit()
            except BaseException:
                await self.db.rollback()
                raise

    async def turn(self, tid):
        async with self.lock:
            result = await self._one("SELECT * FROM turns WHERE id=?", (tid,))
            if result:
                result.pop("request_hash")
                result["metrics"] = json.loads(result["metrics"])
                result["messages"] = await self._all(
                    "SELECT role,text FROM messages WHERE turn_id=? ORDER BY id", (tid,)
                )
            return result

    async def record_live_exchange(
        self,
        sid: str,
        run_id: str,
        user_text: str,
        assistant_text: str,
        metrics: dict | None = None,
    ) -> str | None:
        user_clean = user_text.strip()
        assistant_clean = assistant_text.strip()
        if not user_clean and not assistant_clean:
            return None
        request_id = f"live-{run_id}"[:80]
        tid = uuid.uuid4().hex
        now = utcnow()
        async with self.lock:
            try:
                existing = await self._one(
                    "SELECT id FROM turns WHERE session_id=? AND request_id=?",
                    (sid, request_id),
                )
                if existing:
                    return existing["id"]
                await self.db.execute(
                    "INSERT INTO turns"
                    "(id,session_id,request_id,request_hash,status,has_image,"
                    "created_at,finished_at,metrics) "
                    "VALUES(?,?,?,?,'completed',0,?,?,?)",
                    (tid, sid, request_id, request_id, now, now, json.dumps(metrics or {})),
                )
                if user_clean:
                    await self.db.execute(
                        "INSERT INTO messages(session_id,turn_id,role,text,created_at) "
                        "VALUES(?,?,'user',?,?)",
                        (sid, tid, user_clean[:8000], now),
                    )
                if assistant_clean:
                    await self.db.execute(
                        "INSERT INTO messages(session_id,turn_id,role,text,created_at) "
                        "VALUES(?,?,'assistant',?,?)",
                        (sid, tid, assistant_clean[:16000], now),
                    )
                await self.db.commit()
                return tid
            except BaseException:
                await self.db.rollback()
                raise

    async def context(self, sid):
        async with self.lock:
            session = await self._one("SELECT * FROM sessions WHERE id=?", (sid,))
            facts = await self._all(
                "SELECT id,text FROM facts WHERE character_id=? ORDER BY updated_at DESC LIMIT 12",
                (session["character_id"],),
            )
            history = await self._all(
                "SELECT role,text FROM messages WHERE session_id=? AND context_allowed=1 "
                "ORDER BY id DESC LIMIT 12",
                (sid,),
            )
            return facts, list(reversed(history))

    async def memory_snapshot(self, sid, limit):
        async with self.lock:
            session = await self._one("SELECT * FROM sessions WHERE id=?", (sid,))
            state = await self._one(
                "SELECT epoch FROM memory_state WHERE character_id=?", (session["character_id"],)
            )
            sources = await self._all(
                "SELECT m.id,m.text FROM messages m JOIN sessions s ON s.id=m.session_id "
                "WHERE s.character_id=? AND m.context_allowed=1 AND m.role='user' "
                "ORDER BY m.id DESC LIMIT ?",
                (session["character_id"], limit),
            )
            bounded, size = [], 0
            for item in sources:
                if size + len(item["text"]) > 20000:
                    break
                size += len(item["text"])
                bounded.append(item)
            return session["character_id"], state["epoch"], list(reversed(bounded))

    async def create_job(self, jid, sid, cid, epoch):
        async with self.lock:
            await self.db.execute(
                "INSERT INTO memory_jobs(id,session_id,character_id,epoch,status,created_at) "
                "VALUES(?,?,?,?,'queued',?)",
                (jid, sid, cid, epoch, utcnow()),
            )
            await self.db.commit()

    async def job_state(self, jid, status, error_code=None):
        async with self.lock:
            await self.db.execute(
                "UPDATE memory_jobs SET status=?,error_code=?,finished_at=? WHERE id=?",
                (status, error_code, None if status == "running" else utcnow(), jid),
            )
            await self.db.commit()

    async def save_candidates(self, jid, candidates: list[FactCandidate]):
        async with self.lock:
            try:
                job = await self._one("SELECT * FROM memory_jobs WHERE id=?", (jid,))
                state = await self._one(
                    "SELECT epoch FROM memory_state WHERE character_id=?", (job["character_id"],)
                )
                if state["epoch"] != job["epoch"]:
                    raise StaleMemory
                seen = set()
                for candidate in candidates:
                    if candidate.text in seen:
                        continue
                    seen.add(candidate.text)
                    await self.db.execute(
                        "INSERT INTO proposals(id,job_id,character_id,epoch,text,source_ids) "
                        "VALUES(?,?,?,?,?,?)",
                        (
                            uuid.uuid4().hex,
                            jid,
                            job["character_id"],
                            job["epoch"],
                            candidate.text,
                            json.dumps(candidate.source_message_ids),
                        ),
                    )
                await self.db.execute(
                    "UPDATE memory_jobs SET status='completed',proposal_count=?,finished_at=? "
                    "WHERE id=?",
                    (len(seen), utcnow(), jid),
                )
                await self.db.commit()
            except BaseException:
                await self.db.rollback()
                raise

    async def job(self, jid):
        async with self.lock:
            job = await self._one("SELECT * FROM memory_jobs WHERE id=?", (jid,))
            if job:
                job["proposals"] = await self._all("SELECT * FROM proposals WHERE job_id=?", (jid,))
                for p in job["proposals"]:
                    p["source_message_ids"] = json.loads(p.pop("source_ids"))
            return job

    async def accept(self, pid):
        async with self.lock:
            try:
                proposal = await self._one("SELECT * FROM proposals WHERE id=?", (pid,))
                if not proposal:
                    raise KeyError(pid)
                state = await self._one(
                    "SELECT epoch FROM memory_state WHERE character_id=?",
                    (proposal["character_id"],),
                )
                if proposal["epoch"] != state["epoch"] or proposal["status"] == "stale":
                    raise StaleMemory
                existing = await self._one(
                    "SELECT * FROM facts WHERE character_id=? AND text=?",
                    (proposal["character_id"], proposal["text"]),
                )
                fid = existing["id"] if existing else uuid.uuid4().hex
                if not existing:
                    await self.db.execute(
                        "INSERT INTO facts VALUES(?,?,?,?,?,?)",
                        (
                            fid,
                            proposal["character_id"],
                            proposal["text"],
                            proposal["source_ids"],
                            utcnow(),
                            utcnow(),
                        ),
                    )
                await self.db.execute("UPDATE proposals SET status='accepted' WHERE id=?", (pid,))
                await self.db.commit()
                return await self._one("SELECT id,text,character_id FROM facts WHERE id=?", (fid,))
            except BaseException:
                await self.db.rollback()
                raise

    async def facts(self, cid):
        async with self.lock:
            return await self._all(
                "SELECT id,text,created_at,updated_at FROM facts WHERE character_id=? "
                "ORDER BY created_at",
                (cid,),
            )

    async def fact(self, fid):
        async with self.lock:
            return await self._one("SELECT id,character_id,text FROM facts WHERE id=?", (fid,))

    async def edit_fact(self, fid, text: str | None):
        async with self.lock:
            try:
                fact = await self._one("SELECT * FROM facts WHERE id=?", (fid,))
                if not fact:
                    raise KeyError(fid)
                cid = fact["character_id"]
                if text is None:
                    await self.db.execute("DELETE FROM facts WHERE id=?", (fid,))
                else:
                    await self.db.execute(
                        "UPDATE facts SET text=?,updated_at=? WHERE id=?", (text, utcnow(), fid)
                    )
                # Invalidate older context as a whole: an assistant may have repeated the fact.
                # Chat history remains inspectable locally but is excluded from model requests.
                await self.db.execute(
                    "UPDATE messages SET context_allowed=0 WHERE session_id IN "
                    "(SELECT id FROM sessions WHERE character_id=?)",
                    (cid,),
                )
                await self.db.execute(
                    "UPDATE memory_state SET epoch=epoch+1 WHERE character_id=?", (cid,)
                )
                await self.db.execute(
                    "UPDATE proposals SET status='stale' WHERE character_id=?", (cid,)
                )
                await self.db.commit()
                return cid
            except BaseException:
                await self.db.rollback()
                raise
