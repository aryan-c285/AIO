"""
Tools Router — QR code generation and password generation.
"""

from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

from services import tools_service

router = APIRouter()


# --------------------------------------------------------------------------- #
# POST /qr-generate
# --------------------------------------------------------------------------- #
@router.post("/qr-generate")
async def qr_generate(
    data: str = Form(...),
    size: int = Form(10),
    error_correction: str = Form("M"),
):
    if not data or not data.strip():
        raise HTTPException(status_code=400, detail="Data/text is required to generate a QR code.")
    if len(data) > 4000:
        raise HTTPException(status_code=400, detail="Input text is too long (max 4000 characters).")
    if size < 1 or size > 40:
        raise HTTPException(status_code=400, detail="Size must be between 1 and 40.")

    try:
        result = tools_service.generate_qr(
            data=data.strip(),
            size=size,
            error_correction=error_correction,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QR generation failed: {e}")

    return StreamingResponse(
        result,
        media_type="image/png",
        headers={"Content-Disposition": "attachment; filename=qrcode.png"},
    )


# --------------------------------------------------------------------------- #
# POST /password-generate
# --------------------------------------------------------------------------- #
@router.post("/password-generate")
async def password_generate(
    length: int = Form(16),
    include_uppercase: bool = Form(True),
    include_digits: bool = Form(True),
    include_symbols: bool = Form(True),
):
    if length < 4 or length > 128:
        raise HTTPException(status_code=400, detail="Password length must be between 4 and 128.")

    try:
        password = tools_service.generate_password(
            length=length,
            include_uppercase=include_uppercase,
            include_digits=include_digits,
            include_symbols=include_symbols,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password generation failed: {e}")

    return JSONResponse(content={"password": password})
