from contextlib import asynccontextmanager

import httpx
import pytest
from pydantic import SecretStr

from companion.api import create_app
from companion.config import Settings

TOKEN = "test-local-token-no-real-credentials"


@pytest.fixture
def settings(tmp_path):
    return Settings(
        _env_file=None, data_dir=tmp_path, api_token=SecretStr(TOKEN), mock_delay_s=0.001
    )


@asynccontextmanager
async def client_for(settings, providers=None):
    app = create_app(settings, providers)
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://127.0.0.1",
            headers={"Authorization": "Bearer " + TOKEN},
        ) as client:
            yield client, app


async def new_session(client, **values):
    response = await client.post("/v1/sessions", json=values)
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def start(client, sid, text="你好", **values):
    body = {"request_id": "req-1", "text": text, **values}
    result = await client.post(f"/v1/sessions/{sid}/turns", json=body)
    assert result.status_code == 202, result.text
    return result.json()["turn_id"]


async def events(client, tid):
    import json

    result = await client.get(f"/v1/turns/{tid}/events")
    assert result.status_code == 200, result.text
    return [json.loads(line[6:]) for line in result.text.splitlines() if line.startswith("data: ")]
