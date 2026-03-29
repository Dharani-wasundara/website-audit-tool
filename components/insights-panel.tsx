"use client";

import { useState } from "react";

import type { AuditInsights, InsightSection } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "seo" as const, label: "SEO" },
  { id: "messaging" as const, label: "Messaging" },
  { id: "cta" as const, label: "CTA" },
  { id: "ux" as const, label: "UX" },
  { id: "contentDepth" as const, label: "Content" },
] as const;

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));
  return (
    <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
      <div
        className="h-full rounded-full bg-[#00d4ff]/80 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SectionBody({ section }: { section: InsightSection }) {
  return (
    <>
      <ScoreBar score={section.score} />
      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        {section.summary}
      </p>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        Issues
      </p>
      <ul className="space-y-2">
        {section.issues.map((issue, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-400">
            <span className="text-[#00d4ff]">·</span>
            {issue}
          </li>
        ))}
      </ul>
    </>
  );
}

export function InsightsPanel({ insights }: { insights: AuditInsights }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("seo");

  const section = insights[tab];

  return (
    <div className="mb-10">
      <h2 className="mb-4 font-mono text-sm font-medium uppercase tracking-wide text-zinc-400">
        AI insights
      </h2>
      <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-black/30 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 font-mono text-xs transition-colors",
              tab === t.id
                ? "bg-[#00d4ff]/15 text-[#00d4ff]"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <span className="font-mono text-sm text-zinc-400">
            {TABS.find((x) => x.id === tab)?.label} score
          </span>
          <span className="font-mono text-lg font-semibold text-zinc-100">
            {section.score}
            <span className="text-zinc-600">/10</span>
          </span>
        </div>
        <SectionBody section={section} />
      </div>
    </div>
  );
}
