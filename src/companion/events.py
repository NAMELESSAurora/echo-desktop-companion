import asyncio
import json
from collections import deque
from dataclasses import dataclass, field

from companion.models import utcnow

TERMINAL = {"turn.completed", "turn.cancelled", "turn.failed"}


class ReplayExpired(Exception):
    pass


@dataclass
class EventLog:
    session_id: str
    turn_id: str
    max_bytes: int
    events: deque = field(default_factory=deque)
    condition: asyncio.Condition = field(default_factory=asyncio.Condition)
    next_id: int = 1
    size: int = 0
    closed: bool = False

    async def emit(self, kind: str, data: dict | None = None):
        async with self.condition:
            if self.closed:
                return
            event = {
                "schema_version": 1,
                "id": self.next_id,
                "type": kind,
                "session_id": self.session_id,
                "turn_id": self.turn_id,
                "timestamp": utcnow(),
                "data": data or {},
            }
            self.next_id += 1
            encoded = json.dumps(event, ensure_ascii=False, separators=(",", ":"))
            weight = len(encoded.encode())
            self.events.append((event, encoded, weight))
            self.size += weight
            while self.size > self.max_bytes and len(self.events) > 1:
                self.size -= self.events.popleft()[2]
            if kind in TERMINAL:
                self.closed = True
            self.condition.notify_all()

    def check_cursor(self, after: int):
        if self.events and after < self.events[0][0]["id"] - 1:
            raise ReplayExpired
        if after >= self.next_id:
            raise ValueError("Event cursor is ahead of this turn")

    async def stream(self, after: int = 0):
        cursor = after
        while True:
            async with self.condition:
                self.check_cursor(cursor)
                pending = [(e, encoded) for e, encoded, _ in self.events if e["id"] > cursor]
                closed = self.closed
                if not pending and not closed:
                    try:
                        await asyncio.wait_for(self.condition.wait(), 10)
                    except TimeoutError:
                        pass
                    continue_wait = True
                else:
                    continue_wait = False
            if continue_wait:
                yield ": keepalive\n\n"
                continue
            for event, encoded in pending:
                cursor = event["id"]
                yield f"id: {cursor}\nevent: {event['type']}\ndata: {encoded}\n\n"
            if closed:
                return


class SentenceBuffer:
    def __init__(self, max_chars: int = 120):
        self.buffer = ""
        self.max_chars = max_chars

    def feed(self, text: str) -> list[str]:
        self.buffer += text
        result = []
        while self.buffer:
            end = next((i + 1 for i, ch in enumerate(self.buffer) if ch in "。！？!?；;\n"), None)
            if end is None and len(self.buffer) >= self.max_chars:
                end = self.max_chars
            if end is None:
                break
            part, self.buffer = self.buffer[:end].strip(), self.buffer[end:]
            if part:
                result.append(part)
        return result

    def flush(self) -> list[str]:
        text, self.buffer = self.buffer.strip(), ""
        return [text] if text else []
