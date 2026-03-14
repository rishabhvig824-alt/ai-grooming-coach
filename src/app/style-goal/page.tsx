"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button, SelectionChip } from "@/components/ui";
import { styleGoalOptions, currentStyleOptions } from "@/lib/mock-data";
import type { StyleGoal, CurrentStyle } from "@/types/analysis";
import { Suspense } from "react";

function StyleGoalForm() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category") ?? "full_grooming";

  const [selectedGoal, setSelectedGoal] = useState<StyleGoal | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<CurrentStyle | null>(null);

  const handleContinue = () => {
    if (!selectedGoal) return;
    const query = new URLSearchParams({
      category,
      style_goal: selectedGoal,
      ...(selectedStyle ? { current_style: selectedStyle } : {}),
    });
    router.push(`/upload?${query}`);
  };

  return (
    <main className="min-h-screen bg-surface-bg flex flex-col px-4 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-content-secondary text-sm mb-6 -ml-1"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-content-primary mb-1">
        What look are you aiming for?
      </h1>
      <p className="text-content-secondary text-sm mb-6">
        Your goal shapes the advice you receive.
      </p>

      {/* Primary goal chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {styleGoalOptions.map((opt) => (
          <SelectionChip
            key={opt.id}
            label={opt.label}
            selected={selectedGoal === opt.id}
            onClick={() => setSelectedGoal(opt.id)}
          />
        ))}
      </div>

      {/* Optional secondary question */}
      <h2 className="text-base font-semibold text-content-primary mb-1">
        How would you describe your current style?
      </h2>
      <p className="text-content-secondary text-sm mb-4">Optional</p>
      <div className="flex flex-wrap gap-2 mb-10">
        {currentStyleOptions.map((opt) => (
          <SelectionChip
            key={opt.id}
            label={opt.label}
            selected={selectedStyle === opt.id}
            onClick={() =>
              setSelectedStyle((prev) => (prev === opt.id ? null : opt.id))
            }
          />
        ))}
      </div>

      <Button fullWidth disabled={!selectedGoal} onClick={handleContinue}>
        Continue
      </Button>
    </main>
  );
}

export default function StyleGoalPage() {
  return (
    <Suspense>
      <StyleGoalForm />
    </Suspense>
  );
}
