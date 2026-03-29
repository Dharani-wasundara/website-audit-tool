"use client";

import type { Recommendation } from "@/lib/types";

function badge(impact: string, effort: string) {
  return `${impact.toUpperCase()} impact · ${effort} effort`;
}

export function RecommendationsList({
  items,
}: {
  items: Recommendation[];
}) {
  const sorted = [...items].sort((a, b) => a.priority - b.priority);

  return (
    <div className="mb-10">
      <h2 className="mb-4 font-mono text-sm font-medium uppercase tracking-wide text-zinc-400">
        Recommendations
      </h2>
      <ul className="space-y-4">
        {sorted.map((rec, i) => (
          <li
            key={`${rec.title}-${i}`}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-[#00d4ff]/20"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-[#00d4ff]">
                #{rec.priority}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                {badge(rec.impact, rec.effort)}
              </span>
            </div>
            <h3 className="mb-2 font-medium text-zinc-100">{rec.title}</h3>
            <p className="mb-3 text-sm leading-relaxed text-zinc-400">
              {rec.reasoning}
            </p>
            <p className="font-mono text-[11px] text-zinc-600">
              Based on: {rec.metric_reference}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
