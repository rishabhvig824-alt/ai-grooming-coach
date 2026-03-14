"""
Grooming feedback generation using OpenAI GPT-4o Vision.
Generates coaching-style feedback sections for each requested grooming area.
"""

import base64
import json
from typing import Optional

from openai import OpenAI

from models import (
    AnalysisResponse,
    DetectedFeatures,
    FeedbackSection,
    GroomingCategory,
    StyleGoal,
)

# Words that must never appear in feedback — enforced in system prompt
BLOCKED_WORDS = ["ugly", "bad face", "unattractive", "ugly beard", "weak", "horrible", "awful"]

STYLE_GOAL_LABELS = {
    "professional": "a polished, professional appearance",
    "dating": "an attractive look for dating and social confidence",
    "clean_everyday": "a clean, approachable everyday look",
    "rugged": "a rugged, masculine aesthetic",
    "modern": "a modern, stylish appearance",
}

SYSTEM_PROMPT = """You are a supportive, expert grooming coach for men.

Your role is to give constructive, confidence-building grooming advice — not to judge or criticize.

STRICT RULES:
1. Every feedback section must follow this structure:
   - positiveObservation: Start with one genuine, specific positive observation about that grooming area.
   - opportunity: Describe one specific, actionable improvement (framed as an opportunity, not a criticism).
   - barberTip: Give one precise, practical instruction the user can give directly to their barber.
2. Never use negative or discouraging language. Forbidden words: ugly, bad, unattractive, weak, horrible, awful, wrong, poor, terrible.
3. Keep all feedback grounded in what is visible in the photo.
4. Respond ONLY with valid JSON matching the schema below — no markdown, no extra text.
5. If a grooming area is not present (e.g. clean-shaven), still provide encouraging guidance about that area.

JSON schema:
{
  "feedback": [
    {
      "area": "hair" | "beard" | "mustache",
      "positiveObservation": "string",
      "opportunity": "string",
      "barberTip": "string"
    }
  ]
}"""


def _areas_for_category(category: GroomingCategory) -> list[str]:
    """Return the grooming areas to analyze based on selected category."""
    if category == "full_grooming":
        return ["hair", "beard", "mustache"]
    return [category]


def _encode_image(image_bytes: bytes) -> str:
    return base64.standard_b64encode(image_bytes).decode("utf-8")


def generate_feedback(
    image_bytes: bytes,
    category: GroomingCategory,
    style_goal: StyleGoal,
    detected_features: DetectedFeatures,
    current_style: Optional[str] = None,
    openai_client: Optional[OpenAI] = None,
) -> list[FeedbackSection]:
    """
    Call GPT-4o Vision with the user's photo and context.
    Returns a list of FeedbackSection objects, one per grooming area.
    """
    client = openai_client or OpenAI()
    areas = _areas_for_category(category)
    goal_label = STYLE_GOAL_LABELS.get(style_goal, style_goal)

    user_prompt = f"""Please analyze this man's grooming and provide feedback for these areas: {", ".join(areas)}.

Context:
- Style goal: {goal_label}
- Current style description: {current_style or "not specified"}
- Face detected: {detected_features.face_detected}
- Beard present (estimated): {detected_features.beard_present}
- Mustache present (estimated): {detected_features.mustache_present}

Provide one feedback section per area listed above. Follow the JSON schema exactly."""

    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=1200,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{_encode_image(image_bytes)}",
                            "detail": "high",
                        },
                    },
                    {"type": "text", "text": user_prompt},
                ],
            },
        ],
    )

    raw = response.choices[0].message.content or ""

    # Strip markdown code fences if model includes them despite instructions
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    parsed = json.loads(raw)
    return [FeedbackSection(**section) for section in parsed["feedback"]]
