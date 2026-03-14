"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Download, MessageCircle, ChevronLeft, CheckCircle, ArrowRight } from "lucide-react";
import { Button, Card, BeforeAfterSlider } from "@/components/ui";
import { mockAnalysisResult, simulationVariants } from "@/lib/mock-data";
import type { SimulationVariant } from "@/types/analysis";
import { Suspense } from "react";

type Tab = "feedback" | "simulation" | "barber-guide";

const TABS: { id: Tab; label: string }[] = [
  { id: "feedback", label: "Feedback" },
  { id: "simulation", label: "Simulation" },
  { id: "barber-guide", label: "Barber Guide" },
];

const AREA_LABELS: Record<string, string> = {
  hair: "Hair",
  beard: "Beard",
  mustache: "Mustache",
};

function ResultsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("feedback");
  const [activeVariant, setActiveVariant] = useState<SimulationVariant>("mid_fade");

  const { feedback, originalImageUrl } = mockAnalysisResult;

  return (
    <main className="min-h-screen bg-surface-bg flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 bg-white border-b border-gray-100">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-content-secondary text-sm mb-4 -ml-1"
        >
          <ChevronLeft className="w-4 h-4" /> Start Over
        </button>
        <h1 className="text-xl font-bold text-content-primary">Your Grooming Feedback</h1>
        <p className="text-content-secondary text-sm mt-1">
          You&apos;ve got a solid foundation. Let&apos;s refine it.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex bg-white border-b border-gray-100 px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-content-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">

        {/* FEEDBACK TAB */}
        {activeTab === "feedback" && (
          <div className="space-y-4">
            {feedback.map((section) => (
              <Card key={section.area}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-feedback-success flex-shrink-0" />
                  <h2 className="font-bold text-content-primary">{AREA_LABELS[section.area]}</h2>
                </div>
                <p className="text-content-secondary text-sm mb-3 leading-relaxed">
                  {section.positiveObservation}
                </p>
                <div className="bg-surface-bg rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide mb-1">Opportunity</p>
                  <p className="text-sm text-content-primary leading-relaxed">{section.opportunity}</p>
                </div>
                <div className="bg-brand-primary/5 rounded-lg p-3">
                  <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide mb-1">Barber Tip</p>
                  <p className="text-sm text-content-primary leading-relaxed">{section.barberTip}</p>
                </div>
              </Card>
            ))}

            {/* CTA to chat */}
            <button
              onClick={() => router.push("/chat")}
              className="w-full flex items-center justify-between bg-brand-primary rounded-card p-4 text-white"
            >
              <div>
                <p className="font-semibold text-sm">Ask your grooming coach</p>
                <p className="text-white/70 text-xs mt-0.5">Get deeper, personalized advice</p>
              </div>
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </button>
          </div>
        )}

        {/* SIMULATION TAB */}
        {activeTab === "simulation" && (
          <div>
            <p className="text-content-secondary text-sm mb-4">
              Drag the slider to compare your current look with a simulated improvement.
            </p>
            <BeforeAfterSlider
              beforeSrc={originalImageUrl}
              afterSrc={simulationVariants[activeVariant].imageUrl}
              className="mb-4"
            />

            <p className="text-xs text-content-secondary font-medium uppercase tracking-wide mb-3">
              Try other styles
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {(Object.entries(simulationVariants) as [SimulationVariant, { label: string }][]).map(
                ([id, { label }]) => (
                  <button
                    key={id}
                    onClick={() => setActiveVariant(id)}
                    className={`px-4 py-2 rounded-chip text-sm font-medium transition-colors ${
                      activeVariant === id
                        ? "bg-brand-primary text-white"
                        : "bg-chip-inactive text-content-primary"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* BARBER GUIDE TAB */}
        {activeTab === "barber-guide" && (
          <div>
            <p className="text-content-secondary text-sm mb-4">
              Take this guide to your barber for precise results.
            </p>

            {/* Annotated image placeholder */}
            <div className="relative rounded-card overflow-hidden shadow-card mb-4 aspect-[3/4] bg-gray-100">
              <Image
                src={originalImageUrl}
                alt="Annotated grooming guide"
                fill
                className="object-cover"
              />
              {/* Annotation overlays */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Neckline annotation */}
                <div className="absolute bottom-[28%] left-4 flex items-center gap-2">
                  <div className="w-16 h-px bg-white/90" />
                  <span className="bg-brand-primary text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    Neckline
                  </span>
                </div>
                {/* Cheek line annotation */}
                <div className="absolute top-[38%] right-4 flex items-center gap-2 flex-row-reverse">
                  <div className="w-12 h-px bg-white/90" />
                  <span className="bg-brand-primary text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    Cheek line
                  </span>
                </div>
                {/* Hair annotation */}
                <div className="absolute top-[10%] left-4 flex items-center gap-2">
                  <div className="w-10 h-px bg-white/90" />
                  <span className="bg-brand-secondary text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    Hair shape
                  </span>
                </div>
              </div>
            </div>

            <Button
              fullWidth
              variant="secondary"
              onClick={() => alert("Download coming in Phase 6 (RVI-15)")}
            >
              <Download className="w-4 h-4 mr-2" /> Download Guide
            </Button>

            <p className="text-center text-xs text-content-secondary mt-4">
              Show this image to your barber for precise instructions.
            </p>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="px-4 pb-6 pt-2 bg-white border-t border-gray-100 flex gap-3">
        <Button
          variant="secondary"
          onClick={() => router.push("/chat")}
          className="flex-1"
        >
          <MessageCircle className="w-4 h-4 mr-2" /> Ask Coach
        </Button>
        <Button
          onClick={() => alert("Download coming in Phase 6 (RVI-15)")}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" /> Download
        </Button>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsDashboard />
    </Suspense>
  );
}
