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

  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const stepTimer = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);
    timersRef.current.push(stepTimer);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.max(0.3, (90 - prev) * 0.025);
        return Math.min(prev + increment, 90);
      });
    }, 80);
    timersRef.current.push(progressTimer);

    // Read URL params — style-goal page pushes snake_case keys
    const base64 = sessionStorage.getItem("groomingPhoto");
    const fileName = sessionStorage.getItem("groomingPhotoName") ?? "photo.jpg";
    const fileType = sessionStorage.getItem("groomingPhotoType") ?? "image/jpeg";
    const category = (params.get("category") ?? "full_grooming") as GroomingCategory;
    const styleGoal = (params.get("style_goal") ?? "clean_everyday") as StyleGoal;
    const currentStyle = (params.get("current_style") ?? undefined) as CurrentStyle | undefined;

    const navigate = (query: URLSearchParams) => {
      timersRef.current.forEach(clearInterval);
      setProgress(100);
      navTimerRef.current = setTimeout(() => router.push(`/results?${query.toString()}`), 300);
    };

    if (!base64) {
      const q = new URLSearchParams(params.toString());
      q.set("mock", "1");
      navigate(q);
      return;
    }

    // Validate that base64 is a proper data URL before decoding
    const parts = base64.split(",");
    if (parts.length < 2 || !parts[1]) {
      const q = new URLSearchParams(params.toString());
      q.set("mock", "1");
      navigate(q);
      return;
    }

    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const file = new File([ab], fileName, { type: fileType });

    analyzePhoto(file, category, styleGoal, currentStyle)
      .then((result) => {
        sessionStorage.setItem("analysisResult", JSON.stringify(result));
        sessionStorage.setItem("groomingPhotoBeforeUrl", base64);
        const q = new URLSearchParams(params.toString());
        navigate(q);
      })
      .catch((err) => {
        timersRef.current.forEach(clearInterval);
        if (err instanceof ApiError && err.statusCode === 400) {
          setErrorMsg(err.message);
        } else {
          const q = new URLSearchParams(params.toString());
          q.set("mock", "1");
          navigate(q);
        }
      });

    const timersCopy = timersRef.current;
    return () => {
      timersCopy.forEach(clearInterval);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
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
      <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center mb-8 animate-pulse">
        <Sparkles className="w-8 h-8 text-white" />
      </div>

      <h1 className="text-xl font-bold text-content-primary mb-2 text-center">
        Analyzing your grooming…
      </h1>
      <p className="text-content-secondary text-sm text-center mb-10">
        Your grooming coach is reviewing your look.
      </p>

      <div className="w-full max-w-xs mb-6">
        <ProgressBar value={progress} label="Analysis progress" />
      </div>

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
