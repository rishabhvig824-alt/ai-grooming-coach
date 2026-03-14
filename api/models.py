from typing import Literal, Optional
from pydantic import BaseModel, Field


GroomingCategory = Literal["hair", "beard", "mustache", "full_grooming"]
StyleGoal = Literal["professional", "dating", "clean_everyday", "rugged", "modern"]
CurrentStyle = Literal["casual", "professional", "rugged", "minimalist", "unsure"]
AreaType = Literal["hair", "beard", "mustache"]
SimulationVariant = Literal["short_beard", "stubble", "mid_fade", "taper_fade"]


class FeedbackSection(BaseModel):
    area: AreaType
    positiveObservation: str = Field(
        description="One encouraging observation about this grooming area"
    )
    opportunity: str = Field(
        description="One specific, actionable improvement opportunity"
    )
    barberTip: str = Field(
        description="One concrete instruction the user can give their barber"
    )


class DetectedFeatures(BaseModel):
    face_detected: bool
    beard_present: bool
    mustache_present: bool
    face_landmark_count: int
    notes: Optional[str] = None


class AnalysisResponse(BaseModel):
    feedback: list[FeedbackSection]
    detected_features: DetectedFeatures
    category: GroomingCategory
    style_goal: StyleGoal


class ErrorResponse(BaseModel):
    error: str
    detail: str


class SimulationResponse(BaseModel):
    prediction_id: str
    status: str = "processing"


class SimulationStatusResponse(BaseModel):
    status: str
    image_url: Optional[str] = None
