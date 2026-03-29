"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { BrandSectionHeading } from "@/components/brand-section-heading";
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
    <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SectionBody({ section }: { section: InsightSection }) {
  return (
    <>
      <ScoreBar score={section.score} />
      <p className="mb-4 text-sm leading-relaxed text-zinc-700">
        {section.summary}
      </p>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        Issues
      </p>
      <ul className="space-y-2">
        {section.issues.map((issue, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-600">
            <span className="text-primary">·</span>
            {issue}
          </li>
        ))}
      </ul>
    </>
  );
}

type Indicator = { left: number; top: number; width: number; height: number };

export function InsightsPanel({ insights }: { insights: AuditInsights }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("seo");
  const [indicator, setIndicator] = useState<Indicator>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const section = insights[tab];

  const updateIndicator = useCallback(() => {
    const track = trackRef.current;
    const idx = TABS.findIndex((x) => x.id === tab);
    const btn = tabRefs.current[idx];
    if (!track || !btn) return;
    const tr = track.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setIndicator({
      left: br.left - tr.left + track.scrollLeft,
      top: br.top - tr.top + track.scrollTop,
      width: br.width,
      height: br.height,
    });
  }, [tab]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    const track = trackRef.current;
    const ro = new ResizeObserver(() => updateIndicator());
    if (track) ro.observe(track);
    window.addEventListener("resize", updateIndicator);
    track?.addEventListener("scroll", updateIndicator, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateIndicator);
      track?.removeEventListener("scroll", updateIndicator);
    };
  }, [updateIndicator]);

  return (
    <div className="mb-10">
      <BrandSectionHeading as="h2" className="mb-2">
        AI insights
      </BrandSectionHeading>
      <div className="-mx-1 rounded-full border border-zinc-200/90 bg-zinc-50/90 px-1.5 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          ref={trackRef}
          role="tablist"
          aria-label="Insight categories"
          className="relative flex flex-nowrap items-center gap-1 overflow-x-auto overflow-y-hidden sm:flex-wrap sm:overflow-visible"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute z-0 rounded-full border border-primary bg-white shadow-sm transition-[left,top,width,height] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:duration-75 motion-reduce:ease-linear"
            style={{
              left: indicator.left,
              top: indicator.top,
              width: indicator.width,
              height: indicator.height,
            }}
          />
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative z-10 inline-flex min-h-9 shrink-0 items-center justify-center rounded-full px-3.5 py-0 text-xs leading-none",
                "transition-colors duration-300 ease-out motion-reduce:duration-75",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                tab === t.id
                  ? "font-semibold text-primary"
                  : "font-medium text-zinc-600 hover:text-zinc-900"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-zinc-500">
            {TABS.find((x) => x.id === tab)?.label} score
          </span>
          <span className="text-lg font-semibold tabular-nums text-primary">
            {section.score}
            <span className="text-zinc-400">/10</span>
          </span>
        </div>
        <SectionBody section={section} />
      </div>
    </div>
  );
}
