import type { AnalysisResponse, GroomingCategory, StyleGoal, CurrentStyle } from "@/types/analysis";

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
