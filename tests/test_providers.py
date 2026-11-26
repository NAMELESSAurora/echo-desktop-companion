import json

import httpx
import pytest
from pydantic import SecretStr

from companion.providers import DeepSeekProvider, ProviderError, QwenSpeechProvider


class Fragmented(httpx.AsyncByteStream):
    def __init__(self, content):
        self.content = content.encode()
        self.closed = False

    async def __aiter__(self):
        for i in range(0, len(self.content), 7):
            yield self.content[i : i + 7]

    async def aclose(self):
        self.closed = True


async def test_deepseek_wire_contract_split_utf8_hidden_reasoning_and_usage(settings):
    settings.deepseek_api_key = SecretStr("test-provider-key")
    captured = []
    stream = Fragmented(
        ": heartbeat\n\n"
        'data: {"choices":[{"delta":{"reasoning_content":"不可朗读"}}]}\n\n'
        'data: {"choices":[{"delta":{"content":"你好。"},"finish_reason":null}]}\n\n'
        'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n'
        'data: {"choices":[],"usage":{"prompt_tokens":10,"completion_tokens":3}}\n\n'
        "data: [DONE]\n\n"
    )

    async def handler(request):
        captured.append(json.loads(request.content))
        assert str(request.url) == "https://api.deepseek.com/v1/chat/completions"
        return httpx.Response(200, stream=stream)

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        provider = DeepSeekProvider(settings, http)
        chunks = [c async for c in provider.reply("vision", [{"role": "user", "content": "看图"}])]
    assert "".join(c.text for c in chunks) == "你好。"
    assert captured[0]["model"] == "deepseek-flash"
    assert captured[0]["thinking"] == {"type": "disabled"}
    assert captured[0]["stream"] is True
    assert chunks[-1].usage["prompt_tokens"] == 10
    assert stream.closed


async def test_missing_finish_marker_is_failure(settings):
    settings.deepseek_api_key = SecretStr("test-key")
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(
            lambda _: httpx.Response(
                200, text='data: {"choices":[{"delta":{"content":"半句"}}]}\n\n'
            )
        )
    ) as http:
        with pytest.raises(ProviderError, match="incomplete_stream"):
            _ = [c async for c in DeepSeekProvider(settings, http).reply("dialogue", [])]


async def test_provider_error_redacts_response_body(settings):
    settings.deepseek_api_key = SecretStr("test-key-not-for-output")
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(
            lambda _: httpx.Response(401, text="secret-upstream-body test-key-not-for-output")
        )
    ) as http:
        with pytest.raises(ProviderError) as error:
            _ = [c async for c in DeepSeekProvider(settings, http).reply("dialogue", [])]
        assert str(error.value) == "provider_auth"


async def test_qwen_tts_sse_multiline_final_audio_and_headers(settings):
    settings.qwen_api_key = SecretStr("test-qwen-key")
    settings.qwen_tts_endpoint = "https://test.ap-southeast-1.maas.aliyuncs.com/speech"
    stream = Fragmented(
        'event: result\ndata: {"output":\n'
        'data: {"audio":{"data":"AAABAA=="},"finish_reason":null}}\n\n'
        'data: {"output":{"audio":{"data":"AgADAA=="},"finish_reason":"stop"},'
        '"usage":{"input_tokens":5,"output_tokens":2}}\n\n'
    )

    async def handler(request):
        body = json.loads(request.content)
        assert request.headers["X-DashScope-SSE"] == "enable"
        assert body["model"] == "qwen-audio-3.1-tts-flash"
        assert body["input"]["format"] == "pcm"
        assert body["input"]["sample_rate"] == 24000
        assert body["input"]["voice"] == "longanhuan_v3.1"
        return httpx.Response(200, stream=stream)

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        chunks = [c async for c in QwenSpeechProvider(settings, http).synthesize("测试。")]
    assert b"".join(c.audio for c in chunks) == b"\x00\x00\x01\x00\x02\x00\x03\x00"
    assert chunks[-1].usage == {"input_tokens": 5, "output_tokens": 2}
    assert stream.closed


async def test_qwen_url_only_completion_does_not_silently_claim_audio(settings):
    settings.qwen_api_key = SecretStr("test-key")
    settings.qwen_tts_endpoint = "https://example.test/speech"
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(
            lambda _: httpx.Response(
                200,
                text='data: {"output":{"audio":{"url":"https://example.test/audio"},'
                '"finish_reason":"stop"}}\n\n',
            )
        )
    ) as http:
        with pytest.raises(ProviderError, match="incomplete_audio_stream"):
            _ = [c async for c in QwenSpeechProvider(settings, http).synthesize("测试")]


async def test_memory_invalid_json_is_reported_as_typed_error(settings):
    settings.deepseek_api_key = SecretStr("test-key")
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(
            lambda _: httpx.Response(
                200,
                json={"choices": [{"finish_reason": "stop", "message": {"content": "not json"}}]},
            )
        )
    ) as http:
        with pytest.raises(ProviderError, match="invalid_memory_response"):
            await DeepSeekProvider(settings, http).organize([{"id": 1, "text": "记住：测试"}])
