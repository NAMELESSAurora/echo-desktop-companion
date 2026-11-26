from conftest import client_for


async def test_mock_cookie_bootstrap_is_same_origin_only_and_does_not_expose_bearer(settings):
    async with client_for(settings) as (client, _):
        client.headers.pop("Authorization")
        assert (await client.post("/ui/connect", json={})).status_code == 403
        assert (await client.get("/v1/config")).status_code == 401
        response = await client.post(
            "/ui/connect",
            json={},
            headers={
                "Origin": "http://127.0.0.1",
                "Sec-Fetch-Site": "same-origin",
                "X-Companion-UI": "1",
            },
        )
        assert response.status_code == 200
        cookie = response.headers["set-cookie"]
        assert "HttpOnly" in cookie and "SameSite=strict" in cookie
        assert settings.api_token.get_secret_value() not in cookie + response.text
        assert (await client.get("/v1/config")).status_code == 200
        cross_origin = await client.post(
            "/v1/sessions", json={}, headers={"Origin": "https://other.test"}
        )
        assert cross_origin.status_code == 403


async def test_ui_never_bootstraps_live_model_access(settings):
    settings.mode = "live"
    async with client_for(settings) as (client, _):
        client.headers.pop("Authorization")
        response = await client.post(
            "/ui/connect",
            json={},
            headers={
                "Origin": "http://127.0.0.1",
                "Sec-Fetch-Site": "same-origin",
                "X-Companion-UI": "1",
            },
        )
        assert response.status_code == 409
        assert "set-cookie" not in response.headers
        assert (await client.get("/v1/config")).status_code == 401


async def test_testbench_static_assets_and_csp(settings):
    async with client_for(settings) as (client, _):
        response = await client.get("/")
        assert response.status_code == 200
        assert 'id="message-input"' in response.text
        assert 'id="choose-screen"' in response.text
        assert "frame-ancestors 'none'" in response.headers["Content-Security-Policy"]
        assert "no-store" in response.headers["Cache-Control"]
        assert settings.api_token.get_secret_value() not in response.text
