"""
Face detection and landmark extraction using MediaPipe FaceMesh.
Determines face presence, estimates beard/mustache zones, and returns
feature data used to enrich the GPT-4o Vision prompt.
"""

import io
import mediapipe as mp
import numpy as np
from PIL import Image

from models import DetectedFeatures

mp_face_mesh = mp.solutions.face_mesh  # type: ignore


# MediaPipe landmark indices for key facial zones
# Reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
CHIN_LANDMARKS = [152, 175, 199, 200, 175]
UPPER_LIP_LANDMARKS = [13, 14, 82, 312]
BEARD_ZONE_LANDMARKS = [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365]


def analyze_face(image_bytes: bytes) -> DetectedFeatures:
    """
    Run MediaPipe FaceMesh on the provided image bytes.
    Returns DetectedFeatures with face presence and grooming zone estimates.
    Raises ValueError if no face is detected.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_array = np.array(image)

    with mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
    ) as face_mesh:
        results = face_mesh.process(img_array)

    if not results.multi_face_landmarks:
        raise ValueError(
            "No face detected. Please upload a clear, front-facing photo with good lighting."
        )

    landmarks = results.multi_face_landmarks[0].landmark
    landmark_count = len(landmarks)

    # Estimate beard/mustache presence by checking relative landmark positions.
    # This is a heuristic — the LLM vision analysis is the authoritative source.
    h, w = img_array.shape[:2]

    chin_y = landmarks[152].y * h
    nose_tip_y = landmarks[4].y * h
    face_height = chin_y - (landmarks[10].y * h)

    # Beard zone: lower third of face
    beard_zone_start = nose_tip_y + (face_height * 0.15)
    beard_present = chin_y > beard_zone_start

    # Mustache zone: area between nose and upper lip
    nose_bottom_y = landmarks[2].y * h
    upper_lip_y = landmarks[13].y * h
    mustache_gap = upper_lip_y - nose_bottom_y
    mustache_present = mustache_gap > (face_height * 0.03)

    return DetectedFeatures(
        face_detected=True,
        beard_present=beard_present,
        mustache_present=mustache_present,
        face_landmark_count=landmark_count,
        notes=f"Face height estimate: {int(face_height)}px. Chin Y: {int(chin_y)}px.",
    )
