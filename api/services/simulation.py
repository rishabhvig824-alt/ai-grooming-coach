"""
Visual grooming simulation using Replicate's SDXL img2img model.
Predictions are created asynchronously — callers receive a prediction ID
immediately and poll /simulate/status to check progress.
"""

import base64
import os

import replicate

from models import SimulationVariant

# Prompts tuned for identity preservation: low prompt_strength keeps the
# person recognisable while applying the grooming change.
VARIANT_PROMPTS: dict[SimulationVariant, str] = {
    "short_beard": "portrait of same man, short trimmed beard, sharp neckline, clean jawline, photorealistic, high quality",
    "stubble": "portrait of same man, light 3-day stubble, clean-shaven edges, photorealistic, high quality",
    "mid_fade": "portrait of same man, mid skin fade haircut, textured top, clean sides, photorealistic, high quality",
    "taper_fade": "portrait of same man, taper fade haircut, blended sides, natural top, photorealistic, high quality",
}

NEGATIVE_PROMPT = (
    "different person, changed identity, cartoon, anime, illustration, "
    "painting, bad anatomy, deformed, blurry, low quality"
)

# SDXL img2img on Replicate — stable version pinned for reproducibility
_SDXL_VERSION = (
    "stability-ai/sdxl:"
    "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
)


def start_simulation(image_bytes: bytes, variant: SimulationVariant) -> str:
    """
    Submit an img2img prediction to Replicate for the given variant.
    Returns the Replicate prediction ID immediately — does NOT wait for output.
    Raises RuntimeError if REPLICATE_API_TOKEN is not configured.
    """
    token = os.getenv("REPLICATE_API_TOKEN")
    if not token:
        raise RuntimeError(
            "REPLICATE_API_TOKEN is not set. Add it to api/.env to enable simulation."
        )

    prompt = VARIANT_PROMPTS[variant]
    # Encode image as a data URI so Replicate accepts it directly
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    image_data_uri = f"data:image/jpeg;base64,{image_b64}"

    prediction = replicate.predictions.create(
        version=_SDXL_VERSION,
        input={
            "prompt": prompt,
            "negative_prompt": NEGATIVE_PROMPT,
            "image": image_data_uri,
            # 0.5 preserves identity; higher values apply the change more strongly
            "prompt_strength": 0.5,
            "num_inference_steps": 30,
            "width": 768,
            "height": 1024,
            "num_outputs": 1,
        },
    )
    return prediction.id


def get_simulation_status(prediction_id: str) -> tuple[str, str | None]:
    """
    Fetch the current status of a Replicate prediction.
    Returns (status, image_url) where status is one of:
      "processing" — still running
      "succeeded"  — done, image_url is populated
      "failed"     — error or cancelled
    """
    prediction = replicate.predictions.get(prediction_id)
    replicate_status = prediction.status  # starting | processing | succeeded | failed | canceled

    if replicate_status == "succeeded":
        output = prediction.output
        # SDXL returns a list of image URLs
        image_url = output[0] if isinstance(output, list) and output else None
        return "succeeded", image_url

    if replicate_status in ("failed", "canceled"):
        return "failed", None

    # starting or processing
    return "processing", None
