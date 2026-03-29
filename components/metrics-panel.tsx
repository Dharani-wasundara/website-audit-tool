"use client";

import type { PageMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";

function toneAlt(pct: number): "good" | "warn" | "bad" {
  if (pct <= 10) return "good";
  if (pct <= 33) return "warn";
  return "bad";
}

function toneMetaTitle(len: number): "good" | "warn" | "bad" {
  if (len === 0) return "bad";
  if (len >= 30 && len <= 60) return "good";
  return "warn";
}

function toneMetaDesc(len: number, has: boolean): "good" | "warn" | "bad" {
  if (!has) return "bad";
  if (len >= 70 && len <= 160) return "good";
  return "warn";
}

function Card({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "warn" | "bad";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/15",
        tone === "good" && "border-emerald-500/20",
        tone === "warn" && "border-amber-500/25",
        tone === "bad" && "border-red-500/25"
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-100">
        {value}
      </p>
      {sub ? (
        <p className="mt-0.5 font-mono text-[11px] text-zinc-600">{sub}</p>
      ) : null}
    </div>
  );
}

export function MetricsPanel({ metrics }: { metrics: PageMetrics }) {
  const altTone = toneAlt(metrics.altTextMissingPct);
  const titleTone = toneMetaTitle(metrics.metaTitleLength);
  const descTone = toneMetaDesc(
    metrics.metaDescLength,
    !!metrics.metaDescription
  );

  return (
    <div className="mb-10">
      <h2 className="mb-4 font-mono text-sm font-medium uppercase tracking-wide text-zinc-400">
        Metrics
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card
          label="Words"
          value={metrics.wordCount.toLocaleString()}
        />
        <Card
          label="Headings"
          value={`${metrics.h1Count} / ${metrics.h2Count} / ${metrics.h3Count}`}
          sub="H1 / H2 / H3"
        />
        <Card label="CTAs" value={String(metrics.ctaCount)} />
        <Card label="Images" value={String(metrics.totalImages)} />
        <Card
          label="Int. links"
          value={String(metrics.internalLinks)}
        />
        <Card
          label="Ext. links"
          value={String(metrics.externalLinks)}
        />
        <Card
          label="Alt text"
          value={
            metrics.totalImages === 0
              ? "—"
              : `${(100 - metrics.altTextMissingPct).toFixed(0)}% ok`
          }
          sub={
            metrics.totalImages === 0
              ? "No images"
              : `${metrics.imagesMissingAlt} missing`
          }
          tone={metrics.totalImages === 0 ? undefined : altTone}
        />
        <Card
          label="Meta"
          value={
            metrics.metaTitle && metrics.metaDescription
              ? "Title + desc"
              : metrics.metaTitle
                ? "Title only"
                : metrics.metaDescription
                  ? "Desc only"
                  : "Missing"
          }
          sub={`Title ${metrics.metaTitleLength} · Desc ${metrics.metaDescLength} chars`}
          tone={
            !metrics.metaTitle && !metrics.metaDescription
              ? "bad"
              : titleTone === "good" && descTone === "good"
                ? "good"
                : "warn"
          }
        />
      </div>
    </div>
  );
}
