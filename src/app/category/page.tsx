"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Smile, User, Star, Shirt, Glasses, Sparkles, Lock, ChevronLeft } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { groomingCategories, lockedCategories } from "@/lib/mock-data";
import type { GroomingCategory } from "@/types/analysis";

const iconMap: Record<string, React.ElementType> = {
  scissors: Scissors,
  smile: Smile,
  user: User,
  star: Star,
  shirt: Shirt,
  glasses: Glasses,
  sparkles: Sparkles,
};

export default function CategoryPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<GroomingCategory | null>(null);
  const [lockedTapped, setLockedTapped] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push(`/style-goal?category=${selected}`);
  };

  return (
    <main className="min-h-screen bg-surface-bg flex flex-col px-4 py-6">
      {/* Back nav */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-content-secondary text-sm mb-6 -ml-1"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-content-primary mb-1">
        What would you like feedback on?
      </h1>
      <p className="text-content-secondary text-sm mb-6">
        Select one area to get started.
      </p>

      {/* Active categories */}
      <div className="flex flex-col gap-3 mb-6">
        {groomingCategories.map((cat) => {
          const Icon = iconMap[cat.icon];
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className={`w-full text-left transition-all rounded-card border-2 p-4 flex items-center gap-4 ${
                isSelected
                  ? "border-brand-primary bg-white shadow-card"
                  : "border-transparent bg-white shadow-card hover:border-gray-200"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "bg-brand-primary" : "bg-surface-bg"
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-brand-primary"}`} />
              </div>
              <div>
                <p className="font-semibold text-content-primary">{cat.label}</p>
                <p className="text-content-secondary text-sm">{cat.description}</p>
              </div>
              {isSelected && (
                <div className="ml-auto w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Locked / coming soon */}
      <p className="text-xs text-content-secondary font-medium uppercase tracking-wide mb-3">
        Coming Soon
      </p>
      <div className="flex flex-col gap-3 mb-8">
        {lockedCategories.map((cat) => {
          const Icon = iconMap[cat.icon] ?? Lock;
          return (
            <div key={cat.label}>
              <button
                onClick={() => setLockedTapped(cat.label)}
                className="w-full text-left rounded-card border-2 border-transparent bg-white/60 shadow-card p-4 flex items-center gap-4 opacity-60"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-bg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-content-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-content-primary">{cat.label}</p>
                </div>
                <Lock className="w-4 h-4 text-content-secondary" />
              </button>
              {lockedTapped === cat.label && (
                <p className="text-xs text-brand-secondary mt-1 ml-1">
                  Coming soon in future updates.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Button fullWidth disabled={!selected} onClick={handleContinue}>
        Continue
      </Button>
    </main>
  );
}
