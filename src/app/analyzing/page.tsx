"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ProgressBar } from "@/components/ui";
import { Suspense } from "react";

const STEPS = [
  "Detecting facial features…",
  "Evaluating beard and neckline…",
  "Assessing hair shape and volume…",
  "Generating your recommendations…",
];

const SIMULATED_DURATION_MS = 3200;
const STEP_INTERVAL_MS = SIMULATED_DURATION_MS / STEPS.length;

function AnalyzingScreen() {
  const router = useRouter();
  const params = useSearchParams();

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Advance through copy steps
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);

    // Smooth progress bar increment
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + 2;
      });
    }, 60);

    // Redirect to results after simulated delay
    const redirectTimer = setTimeout(() => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
      setProgress(100);
      setTimeout(() => router.push(`/results?${params.toString()}`), 300);
    }, SIMULATED_DURATION_MS);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
      clearTimeout(redirectTimer);
    };
  }, [router, params]);

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
