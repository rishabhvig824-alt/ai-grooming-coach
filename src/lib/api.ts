import type { AnalysisResponse, GroomingCategory, StyleGoal, CurrentStyle, SimulationVariant } from "@/types/analysis";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Send a photo to the FastAPI /analyze endpoint and return structured feedback.
 * Throws ApiError with a user-facing message on failure.
 */
export async function analyzePhoto(
  file: File,
  category: GroomingCategory,
  styleGoal: StyleGoal,
  currentStyle?: CurrentStyle,
): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("photo", file);
  form.append("category", category);
  form.append("style_goal", styleGoal);
  if (currentStyle) form.append("current_style", currentStyle);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/analyze`, { method: "POST", body: form });
  } catch {
    throw new ApiError(
      0,
      "Could not reach the analysis service. Make sure it is running on port 8000.",
    );
  }

  if (!response.ok) {
    let detail = "Something went wrong. Please try again.";
    try {
      const body = await response.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, detail);
  }

  return response.json() as Promise<AnalysisResponse>;
}

/**
 * Submit a grooming simulation to Replicate via POST /simulate.
 * Returns the prediction_id immediately — does not wait for the image.
 * Throws ApiError on failure (including 503 when Replicate token is not set).
 */
export async function startSimulation(
  file: File,
  variant: SimulationVariant,
): Promise<string> {
  const form = new FormData();
  form.append("photo", file);
  form.append("variant", variant);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/simulate`, { method: "POST", body: form });
  } catch {
    throw new ApiError(0, "Could not reach the simulation service.");
  }

  if (!response.ok) {
    let detail = "Simulation could not be started.";
    try {
      const body = await response.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, detail);
  }

  const data = await response.json() as { prediction_id: string };
  return data.prediction_id;
}

type PollStatus = "processing" | "succeeded" | "failed";

/**
 * Poll the status of a Replicate simulation prediction.
 * Returns { status, imageUrl } where status is "processing" | "succeeded" | "failed".
 */
export async function pollSimulation(
  predictionId: string,
): Promise<{ status: PollStatus; imageUrl: string | null }> {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE}/simulate/status?prediction_id=${encodeURIComponent(predictionId)}`,
    );
  } catch {
    throw new ApiError(0, "Could not reach the simulation status endpoint.");
  }

  if (!response.ok) {
    throw new ApiError(response.status, "Failed to fetch simulation status.");
  }

  const data = await response.json() as { status: PollStatus; image_url: string | null };
  return { status: data.status, imageUrl: data.image_url };
}
