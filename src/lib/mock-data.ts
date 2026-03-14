import type { AnalysisResult, SimulationVariant } from "@/types/analysis";

/** Realistic mock feedback — replace with live API response in RVI-13 */
export const mockAnalysisResult: AnalysisResult = {
  category: "full_grooming",
  styleGoal: "professional",
  originalImageUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=533&fit=crop&crop=face",
  simulationImageUrl:
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=533&fit=crop&crop=face",
  feedback: [
    {
      area: "hair",
      positiveObservation:
        "Your hair density gives you excellent flexibility in styling — you can pull off both structured and relaxed looks.",
      opportunity:
        "Reducing bulk on the sides would sharpen your silhouette and give you a cleaner, more intentional profile.",
      barberTip:
        "Ask your barber for a mid fade on the sides with a textured top — about 1.5 inches on top, skin fade from the temples down.",
    },
    {
      area: "beard",
      positiveObservation:
        "Your beard density is strong and grows evenly — a great base that most men would envy.",
      opportunity:
        "Raising your neckline slightly would define your jawline and make the beard look more intentional and polished.",
      barberTip:
        "Trim your neckline one finger-width above your Adam's apple. Keep the cheek line natural but clean up any strays above it.",
    },
    {
      area: "mustache",
      positiveObservation:
        "Your mustache connects cleanly with your beard, creating a cohesive look.",
      opportunity:
        "Trimming the mustache slightly shorter than the beard would add definition and prevent it from overpowering your upper lip.",
      barberTip:
        "Use a fine-tooth comb and scissors — trim any hairs that fall over the lip line for a sharp, clean finish.",
    },
  ],
};

export const simulationVariants: Record<
  SimulationVariant,
  { label: string; imageUrl: string }
> = {
  short_beard: {
    label: "Short Beard",
    imageUrl:
      "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&h=533&fit=crop&crop=face",
  },
  stubble: {
    label: "Stubble",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=533&fit=crop&crop=face",
  },
  mid_fade: {
    label: "Mid Fade",
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=533&fit=crop&crop=face",
  },
  taper_fade: {
    label: "Taper Fade",
    imageUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=533&fit=crop&crop=face",
  },
};

export const groomingCategories = [
  { id: "hair" as const, label: "Hair", description: "Get feedback on haircut shape and volume", icon: "scissors" },
  { id: "beard" as const, label: "Beard", description: "Improve beard shape and neckline", icon: "smile" },
  { id: "mustache" as const, label: "Mustache", description: "Refine your mustache proportion", icon: "user" },
  { id: "full_grooming" as const, label: "Full Grooming", description: "Hair + beard + mustache", icon: "star" },
] as const;

export const lockedCategories = [
  { label: "Fashion", icon: "shirt" },
  { label: "Glasses", icon: "glasses" },
  { label: "Skin", icon: "sparkles" },
] as const;

export const styleGoalOptions = [
  { id: "professional" as const, label: "Professional" },
  { id: "dating" as const, label: "Attractive for Dating" },
  { id: "clean_everyday" as const, label: "Clean Everyday Look" },
  { id: "rugged" as const, label: "Rugged / Masculine" },
  { id: "modern" as const, label: "Modern / Stylish" },
] as const;

export const currentStyleOptions = [
  { id: "casual" as const, label: "Casual" },
  { id: "professional" as const, label: "Professional" },
  { id: "rugged" as const, label: "Rugged" },
  { id: "minimalist" as const, label: "Minimalist" },
  { id: "unsure" as const, label: "Unsure" },
] as const;
