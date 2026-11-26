"""Generate multi-resolution Windows ICO and PNG icons for EchoCompanion.exe."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
PORTRAIT = ROOT / "frontend" / "src" / "assets" / "nazuna-avatar.webp"
OUT_ICO = ROOT / "src" / "companion" / "assets" / "echo-companion.ico"
OUT_PNG = ROOT / "src" / "companion" / "assets" / "echo-companion.png"


def build_icon() -> None:
    size = 512
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # Deep nebula rounded badge background
    bg = Image.new("RGBA", (size, size), (18, 16, 30, 255))
    # Soft nebula magenta/indigo radial glow
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    dg = ImageDraw.Draw(glow)
    dg.ellipse((60, 40, 460, 440), fill=(116, 54, 152, 160))
    dg.ellipse((150, 210, 480, 500), fill=(232, 74, 114, 130))
    glow = glow.filter(ImageFilter.GaussianBlur(72))
    bg = Image.alpha_composite(bg, glow)

    # Subtle architectural drafting ring
    ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    dr = ImageDraw.Draw(ring)
    dr.ellipse((46, 46, size - 46, size - 46), outline=(255, 255, 255, 58), width=3)
    dr.ellipse((86, 86, size - 86, size - 86), outline=(255, 255, 255, 34), width=2)
    bg = Image.alpha_composite(bg, ring)

    # Composite Nazuna portrait cropped cleanly around head & upper torso
    if PORTRAIT.exists():
        portrait = Image.open(PORTRAIT).convert("RGBA")
        pw, ph = portrait.size
        crop_side = int(pw * 0.92)
        left = max(0, (pw - crop_side) // 2)
        top = max(0, int(ph * 0.03))
        cropped = portrait.crop((left, top, left + crop_side, top + crop_side))
        cropped = cropped.resize((int(size * 0.94), int(size * 0.94)), Image.Resampling.LANCZOS)
        ox = (size - cropped.width) // 2
        oy = size - cropped.height + 10
        bg.alpha_composite(cropped, (ox, oy))

    # Rounded squircle mask
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((16, 16, size - 16, size - 16), radius=112, fill=255)
    canvas.paste(bg, (0, 0), mask)

    # Crisp glass rim + vermilion Echo signal dot
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    do = ImageDraw.Draw(overlay)
    do.rounded_rectangle(
        (18, 18, size - 18, size - 18), radius=110, outline=(255, 255, 255, 110), width=6
    )
    do.ellipse((384, 56, 444, 116), fill=(232, 59, 30, 255), outline=(255, 245, 240, 210), width=5)
    canvas = Image.alpha_composite(canvas, overlay)

    OUT_ICO.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT_PNG, format="PNG")
    canvas.save(
        OUT_ICO,
        format="ICO",
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    print(f"Generated {OUT_ICO} ({OUT_ICO.stat().st_size} bytes)")


if __name__ == "__main__":
    build_icon()
