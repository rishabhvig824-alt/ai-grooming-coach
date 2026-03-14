import Link from "next/link";
import { Button } from "@/components/ui";
import { Scissors, Smile, User, Sparkles } from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-surface-bg flex flex-col">
      {/* Header */}
      <header className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-brand-primary text-lg tracking-tight">GroomCoach</span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center px-4 py-10">
        <p className="text-content-secondary text-sm font-medium uppercase tracking-widest mb-3">
          AI Grooming Coach
        </p>
        <h1 className="text-[32px] font-bold text-content-primary leading-tight mb-4">
          Look your best.<br />Feel more confident.
        </h1>
        <p className="text-content-secondary text-base leading-relaxed mb-10">
          Upload a photo and get personalized grooming advice — tailored to your style goals.
        </p>

        {/* Category preview pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {[
            { icon: Scissors, label: "Hair" },
            { icon: Smile, label: "Beard" },
            { icon: User, label: "Mustache" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm text-content-secondary border border-gray-200"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          ))}
        </div>

        <Link href="/category" className="block">
          <Button fullWidth>Start Analysis</Button>
        </Link>

        <p className="text-center text-xs text-content-secondary mt-4">
          Free to use · Results in under 30 seconds
        </p>
      </section>

      {/* Footer trust note */}
      <footer className="px-4 pb-8 text-center">
        <p className="text-xs text-content-secondary">
          Your photos are used only for analysis and never shared.
        </p>
      </footer>
    </main>
  );
}
