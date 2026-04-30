"""
PDF Router — endpoints for PDF compression, merging, splitting, and conversion.
"""

from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from services import pdf_service

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME = {"application/pdf"}


async def _validate_pdf(file: UploadFile) -> bytes:
    """Read, validate MIME type, and enforce size limit for a single PDF."""
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Only PDF files are accepted.",
        )
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit.")
    return data


# --------------------------------------------------------------------------- #
# POST /compress
# --------------------------------------------------------------------------- #
@router.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    quality: int = Form(50),
):
    data = await _validate_pdf(file)
    try:
        result = pdf_service.compress_pdf(data, quality=quality)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compression failed: {e}")

    return StreamingResponse(
        result,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=compressed.pdf"},
    )


# --------------------------------------------------------------------------- #
# POST /merge
# --------------------------------------------------------------------------- #
@router.post("/merge")
async def merge_pdfs(
    files: List[UploadFile] = File(...),
):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required to merge.")

    all_bytes: list[bytes] = []
    for f in files:
        b = await _validate_pdf(f)
        all_bytes.append(b)

    try:
        result = pdf_service.merge_pdfs(all_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Merge failed: {e}")

    return StreamingResponse(
        result,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=merged.pdf"},
    )


# --------------------------------------------------------------------------- #
# POST /split
# --------------------------------------------------------------------------- #
@router.post("/split")
async def split_pdf(
    file: UploadFile = File(...),
    pages: str = Form("1"),
):
    data = await _validate_pdf(file)
    try:
        result = pdf_service.split_pdf(data, page_ranges=pages)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Split failed: {e}")

    return StreamingResponse(
        result,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=split.pdf"},
    )


# --------------------------------------------------------------------------- #
# POST /to-word
# --------------------------------------------------------------------------- #
@router.post("/to-word")
async def pdf_to_word(
    file: UploadFile = File(...),
):
    data = await _validate_pdf(file)
    try:
        result = pdf_service.pdf_to_word(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")

    return StreamingResponse(
        result,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": "attachment; filename=converted.docx"},
    )


# --------------------------------------------------------------------------- #
# POST /to-excel
# --------------------------------------------------------------------------- #
@router.post("/to-excel")
async def pdf_to_excel(
    file: UploadFile = File(...),
):
    data = await _validate_pdf(file)
    try:
        result = pdf_service.pdf_to_excel(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")

    return StreamingResponse(
        result,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=converted.xlsx"},
    )
