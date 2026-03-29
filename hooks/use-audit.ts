"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  AuditResponse,
  AuditStep,
  PageMetrics,
  ScrapeResponse,
} from "@/lib/types";

type UseAuditState = {
  step: AuditStep;
  error: string | null;
  scrape: ScrapeResponse | null;
  metrics: PageMetrics | null;
  audit: AuditResponse | null;
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
        const d1 = (await r1.json()) as { error?: string } & Partial<ScrapeResponse>;
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
        const d2 = await r2.json();
        if (!r2.ok) {
          throw new Error(
            typeof d2.error === "string" ? d2.error : "Extract failed"
          );
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
        const d3 = await r3.json();
        if (!r3.ok) {
          throw new Error(
            typeof d3.error === "string" ? d3.error : "Audit failed"
          );
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

  return { step, error, scrape, metrics, audit, retry };
}
