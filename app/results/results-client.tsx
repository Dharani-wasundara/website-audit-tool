"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuditProgress } from "@/components/audit-progress";
import { InsightsPanel } from "@/components/insights-panel";
import { MetricsPanel } from "@/components/metrics-panel";
import { PromptLogDrawer } from "@/components/prompt-log-drawer";
import { RecommendationsList } from "@/components/recommendations-list";
import { WEBAUDIT_URL_STORAGE_KEY } from "@/components/url-input";
import { Button } from "@/components/ui/button";
import { useAudit } from "@/hooks/use-audit";

export function ResultsClient() {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(null);
  const { step, error, metrics, audit, retry } = useAudit(url);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? sessionStorage.getItem(WEBAUDIT_URL_STORAGE_KEY)
        : null;
    if (!stored) {
      router.replace("/");
      return;
    }
    setUrl(stored);
  }, [router]);

  if (!url) {
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
            Metrics above are live; waiting for Gemini…
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
