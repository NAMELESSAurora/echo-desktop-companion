import base64
import binascii
from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def utcnow() -> str:
    return datetime.now(UTC).isoformat()


class InputModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class SessionCreate(InputModel):
    character_id: str = Field(default="companion", pattern=r"^[a-zA-Z0-9_-]{1,64}$")
    system_prompt: str = Field(
        default="你是用户的桌面伙伴。用自然简洁的中文交流。只依据已知事实，不编造个人记忆。",
        min_length=1,
        max_length=4000,
    )


class ScreenPolicy(InputModel):
    enabled: bool
    source_id: str | None = Field(default=None, min_length=1, max_length=128)

    @model_validator(mode="after")
    def source_when_enabled(self):
        if self.enabled and not self.source_id:
            raise ValueError("An explicit source_id is required when enabling vision")
        return self


class ScreenFrame(InputModel):
    image_base64: str = Field(min_length=8, max_length=2_800_000)
    mime_type: Literal["image/png", "image/jpeg", "image/webp"]
    source_id: str = Field(min_length=1, max_length=128)
    policy_epoch: int = Field(ge=1)
    captured_at: datetime

    @model_validator(mode="after")
    def validate_image(self):
        if self.captured_at.tzinfo is None:
            raise ValueError("captured_at requires a timezone")
        try:
            raw = base64.b64decode(self.image_base64, validate=True)
        except (ValueError, binascii.Error) as e:
            raise ValueError("Invalid base64 image") from e
        if len(raw) > 2 * 1024 * 1024:
            raise ValueError("Screen frame exceeds 2 MiB")
        valid = {
            "image/png": raw.startswith(b"\x89PNG\r\n\x1a\n"),
            "image/jpeg": raw.startswith(b"\xff\xd8\xff"),
            "image/webp": raw.startswith(b"RIFF") and raw[8:12] == b"WEBP",
        }
        if not valid[self.mime_type]:
            raise ValueError("Image header does not match mime_type")
        return self


class TurnCreate(InputModel):
    request_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,80}$")
    text: str = Field(min_length=1, max_length=8000)
    speak: bool = True
    supersede: bool = True
    screen: ScreenFrame | None = None

    @field_validator("text")
    @classmethod
    def nonblank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text must not be blank")
        return value.strip()


class MemoryOrganize(InputModel):
    message_limit: int = Field(default=30, ge=1, le=60)


class MemoryEdit(InputModel):
    text: str = Field(min_length=1, max_length=500)

    @field_validator("text")
    @classmethod
    def nonblank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text must not be blank")
        return value.strip()


class FactCandidate(InputModel):
    text: str = Field(min_length=1, max_length=500)
    source_message_ids: list[int] = Field(min_length=1, max_length=10)


class MemoryResult(InputModel):
    facts: list[FactCandidate] = Field(max_length=20)
