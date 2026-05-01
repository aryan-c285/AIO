"""
Video Router — endpoints for video/audio downloading.
"""

import os
import shutil
import tempfile

from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

from services import video_service

router = APIRouter()


# --------------------------------------------------------------------------- #
# POST /info
# --------------------------------------------------------------------------- #
@router.post("/info")
async def video_info(
    url: str = Form(...),
):
    """Extract metadata and available formats for a video URL."""
    if not url or not url.strip():
        raise HTTPException(status_code=400, detail="A valid URL is required.")

    url = url.strip()

    try:
        info = video_service.get_video_info(url)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not extract video info: {e}",
        )

    return JSONResponse(content=info)


# --------------------------------------------------------------------------- #
# POST /download
# --------------------------------------------------------------------------- #
@router.post("/download")
async def video_download(
    url: str = Form(...),
    format_id: str = Form(...),
):
    """Download a specific format and stream the file to the client."""
    if not url or not url.strip():
        raise HTTPException(status_code=400, detail="A valid URL is required.")
    if not format_id or not format_id.strip():
        raise HTTPException(status_code=400, detail="A format ID is required.")

    url = url.strip()
    format_id = format_id.strip()

    # Create a temp directory for this download
    temp_dir = tempfile.mkdtemp(prefix="aio_video_")

    try:
        file_path, filename, mime = video_service.download_video(
            url, format_id, temp_dir
        )
    except Exception as e:
        # Clean up on error
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(
            status_code=500,
            detail=f"Download failed: {e}",
        )

    def _stream_and_cleanup():
        """Read file in 1 MB chunks, then delete the temp directory."""
        try:
            with open(file_path, "rb") as f:
                while chunk := f.read(1024 * 1024):  # 1 MB chunks
                    yield chunk
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    return StreamingResponse(
        _stream_and_cleanup(),
        media_type=mime,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
