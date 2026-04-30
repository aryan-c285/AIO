"""
Image Service — all image processing operations using Pillow (PIL).
Every function operates purely in memory via io.BytesIO.
"""

import io

from PIL import Image


# Allowed output formats and their corresponding Pillow save format / MIME type
FORMAT_MAP = {
    "png": ("PNG", "image/png"),
    "jpg": ("JPEG", "image/jpeg"),
    "jpeg": ("JPEG", "image/jpeg"),
    "webp": ("WEBP", "image/webp"),
    "bmp": ("BMP", "image/bmp"),
    "gif": ("GIF", "image/gif"),
}


def resize_image(
    file_bytes: bytes, width: int, height: int, original_format: str = "png"
) -> tuple[io.BytesIO, str, str]:
    """
    Resize an image to the given width × height.
    Returns (BytesIO, pil_format, mime_type).
    """
    img = Image.open(io.BytesIO(file_bytes))
    img = img.convert("RGBA") if img.mode == "RGBA" else img.convert("RGB")
    img = img.resize((width, height), Image.LANCZOS)

    fmt_key = original_format.lower().replace(".", "")
    pil_fmt, mime = FORMAT_MAP.get(fmt_key, ("PNG", "image/png"))

    # JPEG doesn't support RGBA
    if pil_fmt == "JPEG" and img.mode == "RGBA":
        img = img.convert("RGB")

    output = io.BytesIO()
    img.save(output, format=pil_fmt)
    output.seek(0)
    return output, pil_fmt, mime


def compress_image(
    file_bytes: bytes, quality: int = 70, original_format: str = "png"
) -> tuple[io.BytesIO, str, str]:
    """
    Compress an image by adjusting save quality.
    Returns (BytesIO, pil_format, mime_type).
    """
    img = Image.open(io.BytesIO(file_bytes))

    fmt_key = original_format.lower().replace(".", "")
    pil_fmt, mime = FORMAT_MAP.get(fmt_key, ("PNG", "image/png"))

    # Ensure compatible mode
    if pil_fmt == "JPEG":
        img = img.convert("RGB")
    elif img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")

    output = io.BytesIO()
    save_kwargs: dict = {"format": pil_fmt}
    if pil_fmt in ("JPEG", "WEBP"):
        save_kwargs["quality"] = quality
        save_kwargs["optimize"] = True
    elif pil_fmt == "PNG":
        save_kwargs["optimize"] = True

    img.save(output, **save_kwargs)
    output.seek(0)
    return output, pil_fmt, mime


def convert_image(
    file_bytes: bytes, target_format: str
) -> tuple[io.BytesIO, str, str]:
    """
    Convert an image to the specified target format.
    Returns (BytesIO, pil_format, mime_type).
    """
    img = Image.open(io.BytesIO(file_bytes))
    fmt_key = target_format.lower().replace(".", "")
    pil_fmt, mime = FORMAT_MAP.get(fmt_key, ("PNG", "image/png"))

    if pil_fmt == "JPEG" and img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    elif img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")

    output = io.BytesIO()
    img.save(output, format=pil_fmt)
    output.seek(0)
    return output, pil_fmt, mime


def remove_background(
    file_bytes: bytes, threshold: int = 240
) -> tuple[io.BytesIO, str]:
    """
    Simple threshold-based background removal.
    Pixels whose R, G, and B channels are all above *threshold*
    are made transparent.  Returns (BytesIO, mime_type).
    """
    img = Image.open(io.BytesIO(file_bytes)).convert("RGBA")
    pixels = img.load()

    width, height = img.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r > threshold and g > threshold and b > threshold:
                pixels[x, y] = (r, g, b, 0)

    output = io.BytesIO()
    img.save(output, format="PNG")
    output.seek(0)
    return output, "image/png"
