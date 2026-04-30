"""
Image Router — endpoints for image resize, compress, convert, and background removal.
"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from services import image_service

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/bmp",
    "image/gif",
}


async def _validate_image(file: UploadFile) -> tuple[bytes, str]:
    """Read, validate MIME type, enforce size limit. Returns (bytes, extension)."""
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Accepted: PNG, JPEG, WebP, BMP, GIF.",
        )
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit.")

    # Derive extension from filename or content type
    ext = "png"
    if file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "png"
    return data, ext


# --------------------------------------------------------------------------- #
# POST /resize
# --------------------------------------------------------------------------- #
@router.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Form(800),
    height: int = Form(600),
):
    if width < 1 or height < 1:
        raise HTTPException(status_code=400, detail="Width and height must be positive integers.")
    if width > 10000 or height > 10000:
        raise HTTPException(status_code=400, detail="Maximum dimension is 10000 pixels.")

    data, ext = await _validate_image(file)
    try:
        result, _, mime = image_service.resize_image(data, width, height, ext)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resize failed: {e}")

    return StreamingResponse(
        result,
        media_type=mime,
        headers={"Content-Disposition": f"attachment; filename=resized.{ext}"},
    )


# --------------------------------------------------------------------------- #
# POST /compress
# --------------------------------------------------------------------------- #
@router.post("/compress")
async def compress_image(
    file: UploadFile = File(...),
    quality: int = Form(70),
):
    if quality < 1 or quality > 100:
        raise HTTPException(status_code=400, detail="Quality must be between 1 and 100.")

    data, ext = await _validate_image(file)
    try:
        result, _, mime = image_service.compress_image(data, quality, ext)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compression failed: {e}")

    return StreamingResponse(
        result,
        media_type=mime,
        headers={"Content-Disposition": f"attachment; filename=compressed.{ext}"},
    )


# --------------------------------------------------------------------------- #
# POST /convert
# --------------------------------------------------------------------------- #
@router.post("/convert")
async def convert_image(
    file: UploadFile = File(...),
    target_format: str = Form("png"),
):
    allowed_targets = {"png", "jpg", "jpeg", "webp", "bmp", "gif"}
    fmt = target_format.lower().strip()
    if fmt not in allowed_targets:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported target format: {fmt}. Allowed: {', '.join(allowed_targets)}",
        )

    data, _ = await _validate_image(file)
    try:
        result, _, mime = image_service.convert_image(data, fmt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")

    return StreamingResponse(
        result,
        media_type=mime,
        headers={"Content-Disposition": f"attachment; filename=converted.{fmt}"},
    )


# --------------------------------------------------------------------------- #
# POST /remove-bg
# --------------------------------------------------------------------------- #
@router.post("/remove-bg")
async def remove_background(
    file: UploadFile = File(...),
    threshold: int = Form(240),
):
    if threshold < 0 or threshold > 255:
        raise HTTPException(status_code=400, detail="Threshold must be between 0 and 255.")

    data, _ = await _validate_image(file)
    try:
        result, mime = image_service.remove_background(data, threshold)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {e}")

    return StreamingResponse(
        result,
        media_type=mime,
        headers={"Content-Disposition": "attachment; filename=no-background.png"},
    )
