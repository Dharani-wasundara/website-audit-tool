"use client";

import { BrandSectionHeading } from "@/components/brand-section-heading";
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
        "w-full min-w-0 rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm",
        tone === "good" && "border-emerald-200/90 ring-1 ring-emerald-500/10",
        tone === "warn" && "border-amber-200/90 ring-1 ring-amber-500/10",
        tone === "bad" && "border-red-200/90 ring-1 ring-red-500/10"
      )}
    >
      <p className="break-words text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900">
        {value}
      </p>
      {sub ? (
        <p className="mt-0.5 break-words text-[11px] leading-snug text-zinc-500">
          {sub}
        </p>
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
        "w-full min-w-0 rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm",
        tone === "good" && "border-emerald-200/90 ring-1 ring-emerald-500/10",
        tone === "warn" && "border-amber-200/90 ring-1 ring-amber-500/10",
        tone === "bad" && "border-red-200/90 ring-1 ring-red-500/10"
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
        <span className="ml-2 font-normal normal-case text-zinc-400">
          ({length} chars)
        </span>
      </p>
      <p className="mt-2 break-words text-sm leading-relaxed text-zinc-700">
        {text && text.trim() ? (
          text
        ) : (
          <span className="italic text-zinc-400">Not present in HTML</span>
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
      <BrandSectionHeading as="h2" className="mb-2">
        Factual metrics
      </BrandSectionHeading>
      <p className="mb-3 text-sm leading-relaxed text-zinc-600">
        Extracted from the page HTML (and metadata fallbacks). Separate from
        AI-generated insights below.
      </p>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4">
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

      <BrandSectionHeading as="h3">
        Meta title &amp; description
      </BrandSectionHeading>
      <div className="grid gap-3 md:grid-cols-2">
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
