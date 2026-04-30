"""
Convert Router — endpoints for document format conversion.
"""

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from services import convert_service

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# --------------------------------------------------------------------------- #
# POST /word-to-pdf
# --------------------------------------------------------------------------- #
@router.post("/word-to-pdf")
async def word_to_pdf(
    file: UploadFile = File(...),
):
    allowed = {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    }
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Only Word documents (.docx) are accepted.",
        )

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit.")

    try:
        result = convert_service.word_to_pdf(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")

    return StreamingResponse(
        result,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=converted.pdf"},
    )


# --------------------------------------------------------------------------- #
# POST /excel-to-csv
# --------------------------------------------------------------------------- #
@router.post("/excel-to-csv")
async def excel_to_csv(
    file: UploadFile = File(...),
):
    allowed = {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    }
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Only Excel files (.xlsx) are accepted.",
        )

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit.")

    try:
        result = convert_service.excel_to_csv(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")

    return StreamingResponse(
        result,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=converted.csv"},
    )
