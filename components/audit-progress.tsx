"use client";

import { Check } from "lucide-react";

import type { AuditStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: {
  key: AuditStep;
  label: string;
  shortLabel: string;
}[] = [
  { key: "scraping", label: "Scraping page content", shortLabel: "Scrape" },
  { key: "extracting", label: "Extracting metrics", shortLabel: "Metrics" },
  {
    key: "analyzing",
    label: "Running AI analysis (Gemini)",
    shortLabel: "AI analysis",
  },
];

function stepIndex(step: AuditStep): number {
  if (step === "idle") return -1;
  if (step === "complete") return 3;
  if (step === "error") return -1;
  return STEPS.findIndex((s) => s.key === step);
}

function progressPercent(idx: number): number {
  if (idx < 0) return 0;
  return Math.min(100, Math.round(((idx + 1) / STEPS.length) * 100));
}

function connectorEndPercent(idx: number, n: number): number {
  if (idx < 0) return 0;
  if (idx === n - 1) return 100;
  return ((idx + 0.5) / n) * 100;
}

/** Thin white ring so the track reads cleanly behind nodes */
const nodeRing = "ring-[3px] ring-white";

function StepMarker({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <span
        className={cn(
          "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground",
          nodeRing
        )}
      >
        <Check className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
      </span>
    );
  }
  if (active) {
    return (
      <span
        className={cn(
          "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-primary bg-white",
          nodeRing
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white",
        nodeRing
      )}
    >
      <span className="h-1 w-1 rounded-full bg-zinc-300" />
    </span>
  );
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

  const pct = progressPercent(idx);
  const currentLabel =
    idx >= 0 && idx < STEPS.length ? STEPS[idx].label : null;
  const linePct = connectorEndPercent(idx, STEPS.length);

  return (
    <div className="mb-8 rounded-lg border border-zinc-200/90 bg-white p-3.5 sm:p-4">
      <p className="mb-4 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        Auditing{" "}
        <span className="font-normal normal-case text-primary break-all">
          {url}
        </span>
      </p>
      {step === "error" ? (
        <p className="text-sm text-red-700">Pipeline stopped due to an error.</p>
      ) : (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={
            currentLabel
              ? `Audit progress: ${pct} percent, ${currentLabel}`
              : "Audit progress"
          }
        >
          <div className="mb-4 grid grid-cols-3 gap-0.5">
            {STEPS.map((s, i) => {
              const done = idx > i;
              const active = idx === i;
              const pending = idx < i;
              return (
                <div key={s.key} className="flex justify-center px-0.5 text-center">
                  <span
                    className={cn(
                      "text-[10px] leading-tight sm:text-[11px]",
                      pending && "text-zinc-400",
                      (done || active) && "font-medium text-zinc-900"
                    )}
                  >
                    {s.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="relative min-h-8">
            <div
              className="pointer-events-none absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-zinc-200"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
              style={{ width: `${linePct}%` }}
              aria-hidden
            />
            <ol className="relative z-10 grid grid-cols-3 list-none">
              {STEPS.map((s, i) => {
                const done = idx > i;
                const active = idx === i;
                return (
                  <li
                    key={s.key}
                    className="flex justify-center"
                    aria-current={active ? "step" : undefined}
                  >
                    <StepMarker done={done} active={active} />
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="mt-4 text-center text-xs text-zinc-600">
            {currentLabel ?? "Starting…"}
            <span className="text-zinc-300"> · </span>
            <span className="tabular-nums text-primary">{pct}%</span>
          </p>
        </div>
      )}
    </div>
  );
}
