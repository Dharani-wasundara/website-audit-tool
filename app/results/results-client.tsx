"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { AuditProgress } from "@/components/audit-progress";
import { ExportReportBar } from "@/components/export-report-bar";
import { InsightsPanel } from "@/components/insights-panel";
import { MetricsPanel } from "@/components/metrics-panel";
import { PromptLogDrawer } from "@/components/prompt-log-drawer";
import { RecommendationsList } from "@/components/recommendations-list";
import { Button } from "@/components/ui/button";
import { useAudit } from "@/hooks/use-audit";

function parseAuditUrl(raw: string | null): string | null {
  if (!raw || !raw.trim()) return null;
  try {
    const u = new URL(decodeURIComponent(raw.trim()));
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

export function ResultsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("url");
  const url = useMemo(() => parseAuditUrl(raw), [raw]);

  useEffect(() => {
    if (raw === null || url === null) {
      router.replace("/");
    }
  }, [raw, url, router]);

  const { step, error, scrape, metrics, audit, runId, retry } = useAudit(url);

  if (raw === null || url === null) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-white px-4 text-sm text-zinc-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-10 md:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 space-y-5 sm:mb-8 sm:space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div
              className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-white px-3 py-2 text-[10px] font-semibold tracking-wide text-primary shadow-sm sm:px-4 sm:text-xs"
              role="note"
            >
              WebAudit
            </div>
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:text-[var(--primary-hover)]"
            >
              <ChevronLeft
                className="size-4 shrink-0"
                strokeWidth={2}
                aria-hidden
              />
              Back
            </Link>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-8">
            <div className="min-w-0 md:flex-1">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl md:text-3xl">
                Results
              </h1>
              <p className="mt-1.5 max-w-md text-sm leading-snug text-zinc-500">
                Single-page analysis for this URL
              </p>
            </div>
            <div
              className="w-full min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm leading-normal text-zinc-800 shadow-sm [word-break:break-word] sm:px-3.5 sm:py-2 md:max-w-[min(100%,20rem)] md:w-auto md:self-start md:text-right lg:max-w-md"
              title={url}
            >
              {url}
            </div>
          </div>
        </header>

        <AuditProgress key={`${url}-${runId}`} url={url} step={step} />

        {error ? (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50/80 p-4">
            <p className="text-sm text-red-800">{error}</p>
            <Button
              type="button"
              className="mt-3 bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]"
              onClick={retry}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {metrics ? <MetricsPanel metrics={metrics} /> : null}

        {step === "analyzing" && metrics ? (
          <p className="mb-8 text-sm text-zinc-600">
            Factual metrics above are final; waiting for{" "}
            <span className="font-medium text-primary">Gemini</span> analysis…
          </p>
        ) : null}

        {audit ? (
          <>
            <InsightsPanel insights={audit.insights} />
            <RecommendationsList items={audit.insights.recommendations} />
            {metrics ? (
              <ExportReportBar
                url={url}
                metrics={metrics}
                audit={audit}
                fetchMetadata={scrape?.metadata ?? null}
              />
            ) : null}
            <PromptLogDrawer log={audit.promptLog} />
          </>
        ) : null}
      </div>
    </div>
  );
}
