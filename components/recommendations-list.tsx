"use client";

import { BrandSectionHeading } from "@/components/brand-section-heading";
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
      <BrandSectionHeading as="h2" className="mb-2">
        Recommendations
      </BrandSectionHeading>
      <ul className="space-y-4">
        {sorted.map((rec, i) => (
          <li
            key={`${rec.title}-${i}`}
            className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-medium text-primary">
                #{rec.priority}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                {badge(rec.impact, rec.effort)}
              </span>
            </div>
            <h3 className="mb-2 font-medium text-zinc-900">{rec.title}</h3>
            <p className="mb-3 text-sm leading-relaxed text-zinc-600">
              {rec.reasoning}
            </p>
            <p className="font-mono text-[11px] text-zinc-500">
              Based on: {rec.metric_reference}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
