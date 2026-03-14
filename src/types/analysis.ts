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

export interface AnalysisResult {
  category: GroomingCategory;
  styleGoal: StyleGoal;
  feedback: FeedbackSection[];
  /** Simulated "improved" image URL for before/after slider */
  simulationImageUrl: string;
  /** Original photo URL */
  originalImageUrl: string;
}

export type SimulationVariant =
  | "short_beard"
  | "stubble"
  | "mid_fade"
  | "taper_fade";
