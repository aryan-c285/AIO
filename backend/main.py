"""
AIO Toolkit — FastAPI Backend
Main application entry point.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import pdf, image, convert, tools, video

app = FastAPI(
    title="AIO Toolkit API",
    description="All-in-one file processing and utility toolkit API",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the Next.js dev server + production Vercel URL
# ---------------------------------------------------------------------------
_origins = ["http://localhost:3000"]
_extra = os.getenv("ALLOWED_ORIGINS", "")  # comma-separated extra origins
if _extra:
    _origins.extend([o.strip() for o in _extra.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(pdf.router, prefix="/api/pdf", tags=["PDF Tools"])
app.include_router(image.router, prefix="/api/image", tags=["Image Tools"])
app.include_router(convert.router, prefix="/api/convert", tags=["File Converters"])
app.include_router(tools.router, prefix="/api/tools", tags=["Developer & Everyday Tools"])
app.include_router(video.router, prefix="/api/video", tags=["Video Downloader"])


@app.get("/")
async def root():
    return {"message": "AIO Toolkit API is running"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
