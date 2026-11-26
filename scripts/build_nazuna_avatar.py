"""Generate bespoke studio-framed circular avatar portraits for Nanakusa Nazuna (七草荠).

Creates:
- `frontend/src/assets/nazuna-head.webp` (512x512 RGBA circular editorial medallion)
- Also updates `scripts/make_icon.py` output compatibility.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "frontend" / "src" / "assets" / "nazuna-avatar.webp"
OUT_HEAD = ROOT / "frontend" / "src" / "assets" / "nazuna-head.webp"


def _radial_gradient(
    size: int,
    center: tuple[float, float],
    radius: float,
    inner_rgba: tuple[int, int, int, int],
    outer_rgba: tuple[int, int, int, int],
) -> Image.Image:
    img = Image.new("RGBA", (size, size), outer_rgba)
    px = img.load()
    cx, cy = center
    inv_r = 1.0 / max(radius, 1.0)
    for y in range(size):
        dy = y - cy
        for x in range(size):
            d = math.hypot(x - cx, dy) * inv_r
            t = max(0.0, min(1.0, d))
            s = t * t * (3.0 - 2.0 * t)
            px[x, y] = (
                int(inner_rgba[0] + (outer_rgba[0] - inner_rgba[0]) * s),
                int(inner_rgba[1] + (outer_rgba[1] - inner_rgba[1]) * s),
                int(inner_rgba[2] + (outer_rgba[2] - inner_rgba[2]) * s),
                int(inner_rgba[3] + (outer_rgba[3] - inner_rgba[3]) * s),
            )
    return img


def build_nazuna_avatar() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Source portrait not found: {SOURCE}")

    size = 512
    # 1. Nocturnal Lumen Folio velvet backdrop (deep twilight indigo -> plum rose)
    bg = _radial_gradient(
        size,
        (size * 0.44, size * 0.36),
        size * 0.62,
        (68, 44, 102, 255),
        (16, 13, 28, 255),
    )

    # 2. Luminous cyan-lilac crescent halo + warm vermilion rim light behind Nazuna's silhouette
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    dg = ImageDraw.Draw(glow)
    dg.ellipse((78, 44, 420, 386), fill=(122, 212, 240, 105))
    dg.ellipse((230, 190, 495, 480), fill=(232, 76, 122, 118))
    dg.ellipse((14, 240, 260, 490), fill=(154, 118, 232, 92))
    glow = glow.filter(ImageFilter.GaussianBlur(54))
    bg = Image.alpha_composite(bg, glow)

    # 3. Delicate architectural concentric drafting arcs behind the portrait
    draft = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    dd = ImageDraw.Draw(draft)
    dd.ellipse((34, 34, size - 34, size - 34), outline=(255, 255, 255, 42), width=2)
    dd.ellipse((68, 68, size - 68, size - 68), outline=(170, 224, 245, 52), width=2)
    # 24 fine celestial ticks on outer orbit
    cx = cy = size / 2.0
    for i in range(24):
        ang = (i / 24.0) * math.tau
        r0 = size * 0.435
        r1 = size * (0.452 if i % 6 == 0 else 0.444)
        dd.line(
            (
                cx + math.cos(ang) * r0,
                cy + math.sin(ang) * r0,
                cx + math.cos(ang) * r1,
                cy + math.sin(ang) * r1,
            ),
            fill=(255, 245, 240, 95 if i % 6 == 0 else 48),
            width=2,
        )
    bg = Image.alpha_composite(bg, draft)

    # 4. Precision artistic crop focused on Nazuna's face, turquoise spiral eyes, fang smile & braid
    src = Image.open(SOURCE).convert("RGBA")
    sw, sh = src.size
    # In nazuna-avatar.webp (width~832, height~1216), head + braid + collarbone sit in upper ~40%
    crop_side = int(sw * 0.68)
    left = int(sw * 0.21)
    top = int(sh * 0.008)
    left = max(0, min(left, sw - crop_side))
    top = max(0, min(top, sh - crop_side))
    head = src.crop((left, top, left + crop_side, top + crop_side))
    head = head.resize((int(size * 0.96), int(size * 0.96)), Image.Resampling.LANCZOS)

    # Subtle cyan-rose rim glow extracted from portrait alpha
    alpha = head.split()[3]
    rim = Image.new("RGBA", head.size, (214, 232, 255, 0))
    rim_alpha = alpha.filter(ImageFilter.GaussianBlur(14))
    rim_alpha = ImageChops.multiply(rim_alpha, Image.new("L", head.size, 115))
    rim.putalpha(rim_alpha)

    ox = (size - head.width) // 2 + 4
    oy = (size - head.height) // 2 + 18
    bg.alpha_composite(rim, (ox, oy))
    bg.alpha_composite(head, (ox, oy))

    # 5. Soft bottom atmospheric vignette so neck/shoulders melt gracefully into the medallion
    vignette = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    dv = ImageDraw.Draw(vignette)
    dv.rectangle((0, int(size * 0.78), size, size), fill=(18, 13, 30, 125))
    vignette = vignette.filter(ImageFilter.GaussianBlur(38))
    bg = Image.alpha_composite(bg, vignette)

    # 6. Top-left optical liquid-glass specular crescent + crisp circular mask
    spec = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ds = ImageDraw.Draw(spec)
    ds.arc((12, 12, size - 12, size - 12), start=200, end=330, fill=(255, 255, 255, 165), width=6)
    spec = spec.filter(ImageFilter.GaussianBlur(2.2))
    bg = Image.alpha_composite(bg, spec)

    # Crisp antialiased circular mask (4x supersampled)
    mask_hi = Image.new("L", (size * 2, size * 2), 0)
    ImageDraw.Draw(mask_hi).ellipse((8, 8, size * 2 - 8, size * 2 - 8), fill=255)
    mask = mask_hi.resize((size, size), Image.Resampling.LANCZOS)

    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(bg, (0, 0), mask)

    # Clean final optical inner hairline rim
    rim_ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(rim_ring).ellipse(
        (5, 5, size - 6, size - 6), outline=(255, 255, 255, 125), width=4
    )
    out = Image.alpha_composite(out, rim_ring)

    OUT_HEAD.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT_HEAD, format="WEBP", quality=92, method=6)
    print(f"Generated {OUT_HEAD} ({OUT_HEAD.stat().st_size} bytes, {out.size})")


if __name__ == "__main__":
    build_nazuna_avatar()
