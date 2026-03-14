"""
AI Grooming Coach — FastAPI service
Endpoints:
  GET  /health        — liveness check
  POST /analyze       — analyze a photo and return grooming feedback
"""

import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from models import AnalysisResponse, GroomingCategory, StyleGoal
from services.face_detection import analyze_face
from services.feedback import generate_feedback

load_dotenv()

app = FastAPI(
    title="AI Grooming Coach API",
    version="0.1.0",
    description="Analyzes a photo and returns personalized grooming coaching feedback.",
)

# CORS — allow the Next.js frontend (and any configured origins)
_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/heic", "image/webp"}
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


@app.get("/health", tags=["meta"])
async def health() -> dict:
    return {"status": "ok", "service": "ai-grooming-coach-api"}


@app.post(
    "/analyze",
    response_model=AnalysisResponse,
    tags=["analysis"],
    summary="Analyze a photo and return grooming feedback",
)
async def analyze(
    photo: UploadFile = File(..., description="Front-facing selfie (JPEG/PNG, max 10MB)"),
    category: GroomingCategory = Form(...),
    style_goal: StyleGoal = Form(...),
    current_style: Optional[str] = Form(default=None),
) -> AnalysisResponse:
    # Validate file type
    if photo.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type: {photo.content_type}. Please upload a JPEG or PNG.",
        )

    image_bytes = await photo.read()

    # Validate file size
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Photo must be under {MAX_FILE_SIZE_MB}MB.",
        )

    # Face detection
    try:
        detected_features = analyze_face(image_bytes)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )

    # Generate feedback
    try:
        feedback = generate_feedback(
            image_bytes=image_bytes,
            category=category,
            style_goal=style_goal,
            detected_features=detected_features,
            current_style=current_style,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Feedback generation failed: {str(e)}",
        )

    return AnalysisResponse(
        feedback=feedback,
        detected_features=detected_features,
        category=category,
        style_goal=style_goal,
    )
