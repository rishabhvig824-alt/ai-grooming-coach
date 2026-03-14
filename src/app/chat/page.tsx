"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, Send, Sparkles } from "lucide-react";
import { Button, Card } from "@/components/ui";

const EXAMPLE_QUESTIONS = [
  "What haircut should I ask my barber for?",
  "Would stubble suit my face better?",
  "How often should I trim this beard style?",
  "What products should I use for my hair type?",
];

type Message = { role: "user" | "coach"; text: string };

const MOCK_RESPONSE =
  "Based on your analysis, a mid fade with a textured top would complement your face shape well. Ask your barber for about 1.5 inches on top and a skin fade from the temples down. For maintenance, trim every 3–4 weeks to keep the shape sharp.";

export default function ChatPage() {
  const router = useRouter();
  // Toggle this to true to preview the premium state
  const [isPremium] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "coach", text: MOCK_RESPONSE },
    ]);
    setInput("");
  };

  return (
    <main className="min-h-screen bg-surface-bg flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 bg-white border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-content-secondary text-sm mb-4 -ml-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-content-primary text-base leading-tight">Grooming Coach</h1>
            <p className="text-xs text-content-secondary">Ask anything about grooming</p>
          </div>
        </div>
      </div>

      {isPremium ? (
        <>
          {/* Chat messages */}
          <div className="flex-1 px-4 py-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-content-secondary text-sm text-center py-4">
                  Ask your grooming coach anything:
                </p>
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="w-full text-left bg-white rounded-card shadow-card px-4 py-3 text-sm text-content-primary hover:border-brand-primary border border-transparent transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-primary text-white rounded-tr-sm"
                      : "bg-white text-content-primary shadow-card rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 pb-6 pt-2 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder="Ask your grooming coach…"
                className="flex-1 bg-surface-bg rounded-full px-4 py-3 text-sm text-content-primary outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="w-11 h-11 rounded-full bg-brand-primary flex items-center justify-center disabled:opacity-40"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Locked / free tier state */
        <div className="flex-1 flex flex-col px-4 py-8">
          {/* Example questions (blurred) */}
          <div className="space-y-3 mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-bg z-10 pointer-events-none" />
            {EXAMPLE_QUESTIONS.map((q) => (
              <div
                key={q}
                className="bg-white rounded-card shadow-card px-4 py-3 text-sm text-content-primary blur-[2px] select-none"
              >
                {q}
              </div>
            ))}
          </div>

          {/* Upgrade card */}
          <Card className="text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-5 h-5 text-brand-primary" />
            </div>
            <h2 className="font-bold text-content-primary mb-2">Unlock the Grooming Coach</h2>
            <p className="text-content-secondary text-sm mb-6">
              Ask unlimited follow-up questions and get personalized advice based on your analysis.
            </p>

            <div className="bg-surface-bg rounded-xl p-4 mb-6 text-left space-y-2">
              {[
                "Unlimited grooming questions",
                "Personalized to your analysis",
                "Haircut, beard, and style advice",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-content-primary">
                  <div className="w-4 h-4 rounded-full bg-feedback-success/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-feedback-success" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            <Button fullWidth onClick={() => alert("Stripe coming in Phase 6 (RVI-15)")}>
              Upgrade to Premium
            </Button>
            <p className="text-xs text-content-secondary mt-3">Cancel anytime</p>
          </Card>
        </div>
      )}
    </main>
  );
}
