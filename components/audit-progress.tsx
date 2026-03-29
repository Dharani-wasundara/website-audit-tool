"use client";

import type { AuditStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: { key: AuditStep; label: string }[] = [
  { key: "scraping", label: "Scraping page content" },
  { key: "extracting", label: "Extracting metrics" },
  { key: "analyzing", label: "Running AI analysis (Gemini)" },
];

function stepIndex(step: AuditStep): number {
  if (step === "idle") return -1;
  if (step === "complete") return 3;
  if (step === "error") return -1;
  return STEPS.findIndex((s) => s.key === step);
}

export function AuditProgress({
  url,
  step,
}: {
  url: string;
  step: AuditStep;
}) {
  const idx = stepIndex(step);
  const show = step !== "complete" && step !== "error" && step !== "idle";

  if (!show && step !== "error") {
    return null;
  }

  return (
    <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <p className="mb-4 font-mono text-xs text-zinc-500">
        Auditing{" "}
        <span className="text-[#00d4ff]/90 break-all">{url}</span>
      </p>
      {step === "error" ? (
        <p className="text-sm text-red-400">Pipeline stopped due to an error.</p>
      ) : (
        <ul className="space-y-2 font-mono text-sm">
          {STEPS.map((s, i) => {
            const done = idx > i;
            const active = idx === i;
            return (
              <li
                key={s.key}
                className={cn(
                  "flex items-center gap-2",
                  done && "text-emerald-400/90",
                  active && "text-[#00d4ff]",
                  !done && !active && "text-zinc-600"
                )}
              >
                <span className="w-5 shrink-0">
                  {done ? "✓" : active ? "⟳" : "○"}
                </span>
                {s.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
