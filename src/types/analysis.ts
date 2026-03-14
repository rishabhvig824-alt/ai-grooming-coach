export type GroomingCategory = "hair" | "beard" | "mustache" | "full_grooming";

export type StyleGoal =
  | "professional"
  | "dating"
  | "clean_everyday"
  | "rugged"
  | "modern";

export type CurrentStyle =
  | "casual"
  | "professional"
  | "rugged"
  | "minimalist"
  | "unsure";

export interface FeedbackSection {
  area: "hair" | "beard" | "mustache";
  positiveObservation: string;
  opportunity: string;
  barberTip: string;
}

export interface DetectedFeatures {
  face_detected: boolean;
  beard_present: boolean;
  mustache_present: boolean;
  face_landmark_count: number;
  notes?: string | null;
}

/** Shape returned by the FastAPI /analyze endpoint */
export interface AnalysisResponse {
  feedback: FeedbackSection[];
  detected_features: DetectedFeatures;
  category: GroomingCategory;
  style_goal: StyleGoal;
}

/** Shape used internally by the UI */
export interface AnalysisResult {
  originalImageUrl: string;
  feedback: FeedbackSection[];
  detected?: DetectedFeatures;
}

export type SimulationVariant =
  | "short_beard"
  | "stubble"
  | "mid_fade"
  | "taper_fade";
