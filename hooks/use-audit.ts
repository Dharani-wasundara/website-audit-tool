"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  AuditResponse,
  AuditStep,
  PageMetrics,
  ScrapeResponse,
} from "@/lib/types";

/** Avoid `response.json()` when the platform returns HTML/plain text (e.g. Vercel 5xx pages). */
async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const snippet = text.replace(/\s+/g, " ").slice(0, 200);
    throw new Error(
      res.ok
        ? `Invalid response from server: ${snippet}`
        : `Request failed (${res.status}): ${snippet}`
    );
  }
}

function jsonErrorMessage(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return fallback;
}

type UseAuditState = {
  step: AuditStep;
  error: string | null;
  scrape: ScrapeResponse | null;
  metrics: PageMetrics | null;
  audit: AuditResponse | null;
  /** Increments on retry; use as React `key` to reset child UI for a new run. */
  runId: number;
  retry: () => void;
};

export function useAudit(url: string | null): UseAuditState {
  const [retryKey, setRetryKey] = useState(0);
  const [step, setStep] = useState<AuditStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [scrape, setScrape] = useState<ScrapeResponse | null>(null);
  const [metrics, setMetrics] = useState<PageMetrics | null>(null);
  const [audit, setAudit] = useState<AuditResponse | null>(null);

  const retry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;

    async function run() {
      setError(null);
      setScrape(null);
      setMetrics(null);
      setAudit(null);
      setStep("scraping");

      try {
        const r1 = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const d1 = (await readJsonBody(r1)) as { error?: string } &
          Partial<ScrapeResponse>;
        if (!r1.ok) {
          throw new Error(d1.error ?? "Scrape failed");
        }
        if (cancelled) return;
        const scraped: ScrapeResponse = {
          html: d1.html ?? "",
          markdown: d1.markdown ?? "",
          metadata: d1.metadata ?? {
            title: null,
            description: null,
            ogTitle: null,
            statusCode: 200,
          },
        };
        setScrape(scraped);

        setStep("extracting");
        const r2 = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html: scraped.html,
            url,
            metadata: scraped.metadata,
          }),
        });
        const d2 = await readJsonBody(r2);
        if (!r2.ok) {
          throw new Error(jsonErrorMessage(d2, "Extract failed"));
        }
        if (cancelled) return;
        setMetrics(d2 as PageMetrics);

        setStep("analyzing");
        const r3 = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metrics: d2,
            markdown: scraped.markdown,
            url,
          }),
        });
        const d3 = await readJsonBody(r3);
        if (!r3.ok) {
          throw new Error(jsonErrorMessage(d3, "Audit failed"));
        }
        if (cancelled) return;
        setAudit(d3 as AuditResponse);
        setStep("complete");
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Request failed");
          setStep("error");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [url, retryKey]);

  return { step, error, scrape, metrics, audit, runId: retryKey, retry };
}
