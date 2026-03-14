"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ProgressBar } from "@/components/ui";
import { Suspense } from "react";
import { analyzePhoto, ApiError } from "@/lib/api";
import type { GroomingCategory, StyleGoal, CurrentStyle } from "@/types/analysis";

const STEPS = [
  "Detecting facial features…",
  "Evaluating beard and neckline…",
  "Assessing hair shape and volume…",
  "Generating your recommendations…",
];

const STEP_INTERVAL_MS = 5000;

function AnalyzingScreen() {
  const router = useRouter();
  const params = useSearchParams();

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Use a ref so the cleanup closure always sees the latest timers
  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Step text animation — advances every STEP_INTERVAL_MS
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);
    timersRef.current.push(stepTimer);

    // Smooth progress fill up to 90% while we wait for the API
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        // Logarithmic feel: fast at first, slows near 90
        const increment = Math.max(0.3, (90 - prev) * 0.025);
        return Math.min(prev + increment, 90);
      });
    }, 80);
    timersRef.current.push(progressTimer);

    // Retrieve photo + params from sessionStorage
    const base64 = sessionStorage.getItem("groomingPhoto");
    const fileName = sessionStorage.getItem("groomingPhotoName") ?? "photo.jpg";
    const fileType = sessionStorage.getItem("groomingPhotoType") ?? "image/jpeg";
    const category = (params.get("category") ?? "full_grooming") as GroomingCategory;
    const styleGoal = (params.get("styleGoal") ?? "clean_everyday") as StyleGoal;
    const currentStyle = (params.get("currentStyle") ?? undefined) as CurrentStyle | undefined;

    const navigate = (query: URLSearchParams) => {
      timersRef.current.forEach(clearInterval);
      setProgress(100);
      setTimeout(() => router.push(`/results?${query.toString()}`), 300);
    };

    if (!base64) {
      // No photo in session — fall back to mock data flow
      const q = new URLSearchParams(params.toString());
      q.set("mock", "1");
      navigate(q);
      return;
    }

    // Decode base64 back to a File object
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const file = new File([ab], fileName, { type: fileType });

    analyzePhoto(file, category, styleGoal, currentStyle)
      .then((result) => {
        sessionStorage.setItem("analysisResult", JSON.stringify(result));
        // Store the original photo for the before/after slider
        sessionStorage.setItem("groomingPhotoBeforeUrl", base64);
        const q = new URLSearchParams(params.toString());
        navigate(q);
      })
      .catch((err) => {
        timersRef.current.forEach(clearInterval);
        if (err instanceof ApiError && err.statusCode === 400) {
          // e.g. "No face detected" — surface to user
          setErrorMsg(err.message);
        } else {
          // Network/server error — fall back gracefully to mock
          console.error("Analysis API error:", err);
          const q = new URLSearchParams(params.toString());
          q.set("mock", "1");
          navigate(q);
        }
      });

    const timersCopy = timersRef.current;
    return () => {
      timersCopy.forEach(clearInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (errorMsg) {
    return (
      <main className="min-h-screen bg-surface-bg flex flex-col items-center justify-center px-4 gap-6">
        <div className="w-16 h-16 rounded-2xl bg-feedback-warning/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-feedback-warning" />
        </div>
        <h1 className="text-xl font-bold text-content-primary text-center">We hit a snag</h1>
        <p className="text-content-secondary text-sm text-center max-w-xs">{errorMsg}</p>
        <button
          onClick={() => router.back()}
          className="text-brand-primary text-sm font-medium underline underline-offset-2"
        >
          Try a different photo
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-bg flex flex-col items-center justify-center px-4">
      {/* Animated logo mark */}
      <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center mb-8 animate-pulse">
        <Sparkles className="w-8 h-8 text-white" />
      </div>

      <h1 className="text-xl font-bold text-content-primary mb-2 text-center">
        Analyzing your grooming…
      </h1>
      <p className="text-content-secondary text-sm text-center mb-10">
        Your grooming coach is reviewing your look.
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-6">
        <ProgressBar value={progress} label="Analysis progress" />
      </div>

      {/* Step copy */}
      <p
        key={stepIndex}
        className="text-content-secondary text-sm text-center transition-opacity duration-300"
      >
        {STEPS[stepIndex]}
      </p>
    </main>
  );
}

export default function AnalyzingPage() {
  return (
    <Suspense>
      <AnalyzingScreen />
    </Suspense>
  );
}
