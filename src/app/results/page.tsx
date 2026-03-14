"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Download, MessageCircle, ChevronLeft, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button, Card, BeforeAfterSlider } from "@/components/ui";
import { mockAnalysisResult, simulationVariants } from "@/lib/mock-data";
import { startSimulation, pollSimulation } from "@/lib/api";
import type {
  AnalysisResult,
  AnalysisResponse,
  SimulationVariant,
  SimulationState,
} from "@/types/analysis";
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

const ALL_VARIANTS = Object.keys(simulationVariants) as SimulationVariant[];

const IDLE_STATE: SimulationState = { status: "idle", imageUrl: null };

function buildInitialSimMap(): Record<SimulationVariant, SimulationState> {
  return Object.fromEntries(
    ALL_VARIANTS.map((v) => [v, IDLE_STATE]),
  ) as Record<SimulationVariant, SimulationState>;
}

/** Map the API response shape to the UI data shape */
function mapApiResponse(response: AnalysisResponse, photoBase64: string): AnalysisResult {
  return {
    originalImageUrl: photoBase64,
    feedback: response.feedback,
    detected: response.detected_features,
  };
}

/** Reconstruct a File object from the base64 data URI stored in sessionStorage */
function fileFromBase64(base64: string, name: string, type: string): File | null {
  try {
    const parts = base64.split(",");
    if (parts.length < 2 || !parts[1]) return null;
    const bytes = atob(parts[1]);
    const ab = new ArrayBuffer(bytes.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) ia[i] = bytes.charCodeAt(i);
    return new File([ab], name, { type });
  } catch {
    return null;
  }
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 60000;

function ResultsDashboard() {
  const router = useRouter();
  const params = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>("feedback");
  const [activeVariant, setActiveVariant] = useState<SimulationVariant>("mid_fade");
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [simMap, setSimMap] = useState<Record<SimulationVariant, SimulationState>>(buildInitialSimMap);

  // Track per-variant polling intervals so we can clear on unmount or completion
  const pollingRef = useRef<Partial<Record<SimulationVariant, ReturnType<typeof setInterval>>>>({});
  const timeoutRef = useRef<Partial<Record<SimulationVariant, ReturnType<typeof setTimeout>>>>({});
  // Store reconstructed File to avoid re-decoding base64 per chip tap
  const photoFileRef = useRef<File | null>(null);

  // ── Load analysis result ────────────────────────────────────────────────
  useEffect(() => {
    const isMock = params.get("mock") === "1";

    if (!isMock) {
      const raw = sessionStorage.getItem("analysisResult");
      const photoBase64 = sessionStorage.getItem("groomingPhotoBeforeUrl");
      if (raw && photoBase64) {
        try {
          const parsed = JSON.parse(raw) as AnalysisResponse;
          setData(mapApiResponse(parsed, photoBase64));
          return;
        } catch {
          // fall through to mock
        }
      }
    }

    setData(mockAnalysisResult);
  }, [params]);

  // ── Polling helper ──────────────────────────────────────────────────────
  const stopPolling = useCallback((variant: SimulationVariant) => {
    if (pollingRef.current[variant]) {
      clearInterval(pollingRef.current[variant]);
      delete pollingRef.current[variant];
    }
    if (timeoutRef.current[variant]) {
      clearTimeout(timeoutRef.current[variant]);
      delete timeoutRef.current[variant];
    }
  }, []);

  const beginPolling = useCallback(
    (variant: SimulationVariant, predictionId: string) => {
      // Hard timeout — mark failed if not done within 60s
      timeoutRef.current[variant] = setTimeout(() => {
        stopPolling(variant);
        setSimMap((prev) => ({ ...prev, [variant]: { status: "failed", imageUrl: null } }));
      }, POLL_TIMEOUT_MS);

      pollingRef.current[variant] = setInterval(async () => {
        try {
          const { status, imageUrl } = await pollSimulation(predictionId);
          if (status === "succeeded" && imageUrl) {
            stopPolling(variant);
            setSimMap((prev) => ({ ...prev, [variant]: { status: "ready", imageUrl } }));
          } else if (status === "failed") {
            stopPolling(variant);
            setSimMap((prev) => ({ ...prev, [variant]: { status: "failed", imageUrl: null } }));
          }
          // status === "processing" — keep polling
        } catch {
          // Network hiccup — keep polling until timeout
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling],
  );

  // ── Kick off simulation for a variant ──────────────────────────────────
  const triggerSimulation = useCallback(
    async (variant: SimulationVariant) => {
      const file = photoFileRef.current;
      if (!file) return;

      setSimMap((prev) => ({ ...prev, [variant]: { status: "loading", imageUrl: null } }));

      try {
        const predictionId = await startSimulation(file, variant);
        beginPolling(variant, predictionId);
      } catch {
        // 503 = no Replicate token, any other error — fail silently, fallback shown
        setSimMap((prev) => ({ ...prev, [variant]: { status: "failed", imageUrl: null } }));
      }
    },
    [beginPolling],
  );

  // ── Start default simulation once data loads ────────────────────────────
  useEffect(() => {
    if (!data) return;

    const base64 = sessionStorage.getItem("groomingPhoto");
    const name = sessionStorage.getItem("groomingPhotoName") ?? "photo.jpg";
    const type = sessionStorage.getItem("groomingPhotoType") ?? "image/jpeg";

    if (!base64) return; // mock flow — no real photo, skip simulation
    const file = fileFromBase64(base64, name, type);
    if (!file) return;

    photoFileRef.current = file;
    triggerSimulation("mid_fade");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ── Cleanup all polling on unmount ──────────────────────────────────────
  useEffect(() => {
    const polling = pollingRef.current;
    const timeouts = timeoutRef.current;
    return () => {
      Object.values(polling).forEach((id) => id && clearInterval(id));
      Object.values(timeouts).forEach((id) => id && clearTimeout(id));
    };
  }, []);

  // ── Variant chip tap ────────────────────────────────────────────────────
  const handleVariantTap = (variant: SimulationVariant) => {
    setActiveVariant(variant);
    if (simMap[variant].status === "idle") {
      triggerSimulation(variant);
    }
  };

  if (!data) return null;

  const { feedback, originalImageUrl } = data;
  const activeSimState = simMap[activeVariant];

  // Determine what to show in the "after" slot of the slider
  const afterSrc =
    activeSimState.status === "ready" && activeSimState.imageUrl
      ? activeSimState.imageUrl
      : simulationVariants[activeVariant].imageUrl; // mock fallback

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
                  <h2 className="font-bold text-content-primary">{AREA_LABELS[section.area] ?? section.area}</h2>
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

            {/* Slider or skeleton */}
            {activeSimState.status === "loading" ? (
              <div className="w-full aspect-[3/4] rounded-card bg-gray-100 animate-pulse flex flex-col items-center justify-center gap-3 mb-4">
                <Loader2 className="w-8 h-8 text-brand-primary/40 animate-spin" />
                <p className="text-content-secondary text-sm">Generating your simulation…</p>
                <p className="text-content-secondary text-xs">This takes 15–30 seconds</p>
              </div>
            ) : (
              <>
                <BeforeAfterSlider
                  beforeSrc={originalImageUrl}
                  afterSrc={afterSrc}
                  className="mb-2"
                />
                {activeSimState.status === "ready" ? (
                  <p className="text-xs text-content-secondary text-center mb-4">
                    AI-generated preview — results may vary
                  </p>
                ) : (
                  <p className="text-xs text-content-secondary text-center mb-4">
                    Style preview
                  </p>
                )}
              </>
            )}

            {/* Style chips */}
            <p className="text-xs text-content-secondary font-medium uppercase tracking-wide mb-3">
              Try other styles
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {(Object.entries(simulationVariants) as [SimulationVariant, { label: string }][]).map(
                ([id, { label }]) => {
                  const varState = simMap[id];
                  return (
                    <button
                      key={id}
                      onClick={() => handleVariantTap(id)}
                      className={`px-4 py-2 rounded-chip text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        activeVariant === id
                          ? "bg-brand-primary text-white"
                          : "bg-chip-inactive text-content-primary"
                      }`}
                    >
                      {varState.status === "loading" && activeVariant === id && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                      {label}
                    </button>
                  );
                },
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

            {/* Annotated image */}
            <div className="relative rounded-card overflow-hidden shadow-card mb-4 aspect-[3/4] bg-gray-100">
              <Image
                src={originalImageUrl}
                alt="Annotated grooming guide"
                fill
                className="object-cover"
                unoptimized={originalImageUrl.startsWith("data:")}
              />
              {/* Annotation overlays */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-[28%] left-4 flex items-center gap-2">
                  <div className="w-16 h-px bg-white/90" />
                  <span className="bg-brand-primary text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    Neckline
                  </span>
                </div>
                <div className="absolute top-[38%] right-4 flex items-center gap-2 flex-row-reverse">
                  <div className="w-12 h-px bg-white/90" />
                  <span className="bg-brand-primary text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    Cheek line
                  </span>
                </div>
                <div className="absolute top-[10%] left-4 flex items-center gap-2">
                  <div className="w-10 h-px bg-white/90" />
                  <span className="bg-brand-secondary text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    Hair shape
                  </span>
                </div>
              </div>
            </div>

            <Button fullWidth variant="secondary" disabled>
              <Download className="w-4 h-4 mr-2" /> Download Guide
              <span className="ml-2 text-xs opacity-60">(coming soon)</span>
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
        <Button disabled className="flex-1">
          <Download className="w-4 h-4 mr-2" /> Download
          <span className="ml-1.5 text-xs opacity-60">(soon)</span>
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
