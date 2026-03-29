"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { AuditProgress } from "@/components/audit-progress";
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

  const { step, error, metrics, audit, retry } = useAudit(url);

  if (raw === null || url === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] font-mono text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-block font-mono text-sm text-[#00d4ff] hover:underline"
        >
          ← Back
        </Link>
        <h1 className="mb-2 font-mono text-lg text-zinc-100">Results</h1>
        <p className="mb-6 break-all font-mono text-sm text-zinc-500">
          {url}
        </p>

        <AuditProgress url={url} step={step} />

        {error ? (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <p className="text-sm text-red-300">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 border-white/20 text-zinc-200"
              onClick={retry}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {metrics ? <MetricsPanel metrics={metrics} /> : null}

        {step === "analyzing" && metrics ? (
          <p className="mb-8 font-mono text-sm text-zinc-500">
            Factual metrics above are final; waiting for Gemini analysis…
          </p>
        ) : null}

        {audit ? (
          <>
            <InsightsPanel insights={audit.insights} />
            <RecommendationsList items={audit.insights.recommendations} />
            <PromptLogDrawer log={audit.promptLog} />
          </>
        ) : null}
      </div>
    </div>
  );
}
