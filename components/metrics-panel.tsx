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

function MetaTextBlock({
  label,
  text,
  length,
  tone,
}: {
  label: string;
  text: string | null;
  length: number;
  tone: "good" | "warn" | "bad";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.02] p-4",
        tone === "good" && "border-emerald-500/20",
        tone === "warn" && "border-amber-500/25",
        tone === "bad" && "border-red-500/25"
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
        <span className="ml-2 text-zinc-600">({length} chars)</span>
      </p>
      <p className="mt-2 break-words text-sm leading-relaxed text-zinc-300">
        {text && text.trim() ? (
          text
        ) : (
          <span className="italic text-zinc-600">Not present in HTML</span>
        )}
      </p>
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

  const pctMissingAlt =
    metrics.totalImages === 0
      ? null
      : metrics.altTextMissingPct.toFixed(1);

  return (
    <div className="mb-10">
      <h2 className="mb-4 font-mono text-sm font-medium uppercase tracking-wide text-zinc-400">
        Factual metrics
      </h2>
      <p className="mb-4 text-sm text-zinc-500">
        Extracted from the page HTML (and metadata fallbacks). Separate from
        AI-generated insights below.
      </p>
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
          label="% images missing alt"
          value={
            metrics.totalImages === 0
              ? "-"
              : `${pctMissingAlt}%`
          }
          sub={
            metrics.totalImages === 0
              ? "No images"
              : `${metrics.imagesMissingAlt} of ${metrics.totalImages} images · ${(100 - metrics.altTextMissingPct).toFixed(1)}% with alt`
          }
          tone={metrics.totalImages === 0 ? undefined : altTone}
        />
      </div>

      <h3 className="mb-3 mt-8 font-mono text-xs font-medium uppercase tracking-wide text-zinc-500">
        Meta title &amp; description
      </h3>
      <div className="grid gap-3 lg:grid-cols-2">
        <MetaTextBlock
          label="Meta title"
          text={metrics.metaTitle}
          length={metrics.metaTitleLength}
          tone={titleTone}
        />
        <MetaTextBlock
          label="Meta description"
          text={metrics.metaDescription}
          length={metrics.metaDescLength}
          tone={descTone}
        />
      </div>
    </div>
  );
}
