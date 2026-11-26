from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _validate_endpoint(value: str, scheme: str) -> str:
    if value:
        url = urlsplit(value)
        if url.scheme != scheme or not url.hostname or url.username or url.password:
            raise ValueError(
                f"Provider endpoints require {scheme.upper()} without embedded credentials"
            )
        if url.query or url.fragment:
            raise ValueError("Provider endpoints must not contain query strings or fragments")
    return value.rstrip("/")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="COMPANION_", env_file=".env", extra="ignore")
    mode: Literal["mock", "live"] = "mock"
    data_dir: Path = Path(".local")
    api_token: SecretStr = SecretStr("")
    deepseek_base_url: str = "https://api.deepseek.com/v1"
    deepseek_api_key: SecretStr = SecretStr("")
    dialogue_model: str = "deepseek-flash"
    vision_model: str = "deepseek-flash"
    memory_model: str = "deepseek-flash"
    qwen_tts_model: Literal["qwen-audio-3.1-tts-flash", "qwen-audio-3.1-tts-plus"] = (
        "qwen-audio-3.1-tts-flash"
    )
    qwen_tts_endpoint: str = ""
    qwen_api_key: SecretStr = SecretStr("")
    qwen_voice: str = "longanhuan_v3.1"
    sample_rate: Literal[16000, 24000, 48000] = 24000

    # Realtime Full-Duplex Voice Track (default: Qwen 3.1 Realtime Flash)
    live_provider: Literal["qwen", "moss"] = "qwen"
    qwen_realtime_url: str = "wss://dashscope.aliyuncs.com/api-ws/v1/realtime"
    qwen_realtime_model: str = "qwen-audio-3.1-realtime-flash"
    qwen_realtime_voice: str = ""
    qwen_realtime_language: str = "zh"
    qwen_silence_gate_rms: float = Field(default=0.014, ge=0.0, le=0.2)

    # MOSS-Live-1.0 Full-Duplex Realtime Voice Track (optional alternative)
    moss_api_key: SecretStr = SecretStr("")
    moss_realtime_url: str = "wss://api.mosi.cn/v1/realtime"
    moss_rest_base_url: str = "https://api.mosi.cn/v1"
    moss_model: str = "moss-live-1.0"
    moss_voice: str = ""
    moss_persona_name: str = "七草荠"
    moss_persona_aliases: list[str] = Field(default_factory=lambda: ["Nazuna", "回声"])
    moss_memory_scope: Literal["session", "user"] = "session"
    moss_user_id: str = ""
    moss_output_sample_rate: Literal[16000, 24000, 48000] = 24000
    moss_delegation: Literal["none", "server", "client"] = "none"
    moss_idle_timeout_s: float = Field(default=180, ge=5, le=1800)
    moss_max_connections: int = Field(default=1, ge=1, le=3)

    turn_timeout_s: float = Field(default=90, gt=0, le=300)
    provider_read_timeout_s: float = Field(default=25, gt=0, le=120)
    memory_timeout_s: float = Field(default=45, gt=0, le=180)
    max_output_tokens: int = Field(default=512, ge=32, le=2048)
    max_replay_bytes: int = Field(default=2 * 1024 * 1024, ge=1024, le=16 * 1024 * 1024)
    max_retained_turns: int = Field(default=32, ge=2, le=128)
    max_active_turns: int = Field(default=8, ge=1, le=32)
    max_memory_jobs: int = Field(default=4, ge=1, le=16)
    mock_delay_s: float = Field(default=0.012, ge=0, le=1)
    allowed_origins: list[str] = Field(default_factory=list)

    @field_validator("sample_rate", "moss_output_sample_rate", mode="before")
    @classmethod
    def coerce_sample_rate(cls, value):
        if isinstance(value, str) and value.strip().isdigit():
            return int(value.strip())
        return value

    @field_validator("deepseek_base_url", "qwen_tts_endpoint", "moss_rest_base_url")
    @classmethod
    def require_https(cls, value: str) -> str:
        return _validate_endpoint(value, "https")

    @field_validator("moss_realtime_url", "qwen_realtime_url")
    @classmethod
    def require_wss(cls, value: str) -> str:
        return _validate_endpoint(value, "wss")

    def public(self) -> dict:
        active_realtime_model = (
            self.qwen_realtime_model if self.live_provider == "qwen" else self.moss_model
        )
        active_realtime_configured = (
            bool(self.qwen_api_key.get_secret_value())
            if self.live_provider == "qwen"
            else bool(self.moss_api_key.get_secret_value())
        )
        active_voice = (
            self.qwen_realtime_voice if self.live_provider == "qwen" else self.moss_voice
        ) or None
        return {
            "mode": self.mode,
            "models": {
                "dialogue": self.dialogue_model,
                "vision": self.vision_model,
                "memory": self.memory_model,
                "tts": self.qwen_tts_model,
                "realtime": active_realtime_model,
            },
            "thinking": "disabled",
            "audio": {"format": "pcm_s16le", "sample_rate": self.sample_rate, "channels": 1},
            "moss_live": {
                "provider": self.live_provider,
                "model": active_realtime_model,
                "configured": active_realtime_configured,
                "input_audio": {"format": "pcm_s16le", "sample_rate": 16000, "channels": 1},
                "output_audio": {
                    "format": "pcm_s16le",
                    "sample_rate": 24000
                    if self.live_provider == "qwen"
                    else self.moss_output_sample_rate,
                    "channels": 1,
                },
                "voice": active_voice,
                "persona_name": self.moss_persona_name,
                "memory_scope": self.moss_memory_scope,
                "delegation": self.moss_delegation,
                "idle_timeout_s": self.moss_idle_timeout_s,
            },
            "configured": {
                "deepseek": bool(self.deepseek_api_key.get_secret_value()),
                "qwen_tts": bool(self.qwen_api_key.get_secret_value() and self.qwen_tts_endpoint),
                "qwen_realtime": bool(self.qwen_api_key.get_secret_value()),
                "moss_live": bool(self.moss_api_key.get_secret_value()),
                "live_voice": active_realtime_configured,
            },
            "deferred": ["screen_capture", "tools", "host_integration"],
        }
