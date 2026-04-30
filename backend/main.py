"""
AIO Toolkit — FastAPI Backend
Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import pdf, image, convert, tools

app = FastAPI(
    title="AIO Toolkit API",
    description="All-in-one file processing and utility toolkit API",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the Next.js dev server
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(pdf.router, prefix="/api/pdf", tags=["PDF Tools"])
app.include_router(image.router, prefix="/api/image", tags=["Image Tools"])
app.include_router(convert.router, prefix="/api/convert", tags=["File Converters"])
app.include_router(tools.router, prefix="/api/tools", tags=["Developer & Everyday Tools"])


@app.get("/")
async def root():
    return {"message": "AIO Toolkit API is running"}
