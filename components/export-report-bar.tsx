"use client";

import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import type { AuditResponse, FirecrawlMetadata, PageMetrics } from "@/lib/types";
import {
  auditExportToMarkdown,
  buildAuditExportPayload,
  getExportFilename,
} from "@/lib/report-export";

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function ExportReportBar({
  url,
  metrics,
  audit,
  fetchMetadata,
}: {
  url: string;
  metrics: PageMetrics;
  audit: AuditResponse;
  fetchMetadata?: Pick<
    FirecrawlMetadata,
    "title" | "description" | "ogTitle" | "statusCode"
  > | null;
}) {
  const downloadJson = useCallback(() => {
    const payload = buildAuditExportPayload({
      url,
      metrics,
      audit,
      fetchMetadata: fetchMetadata ?? null,
    });
    downloadText(
      JSON.stringify(payload, null, 2),
      getExportFilename(url, "json"),
      "application/json;charset=utf-8"
    );
  }, [url, metrics, audit, fetchMetadata]);

  const downloadMd = useCallback(() => {
    const payload = buildAuditExportPayload({
      url,
      metrics,
      audit,
      fetchMetadata: fetchMetadata ?? null,
    });
    downloadText(
      auditExportToMarkdown(payload),
      getExportFilename(url, "md"),
      "text/markdown;charset=utf-8"
    );
  }, [url, metrics, audit, fetchMetadata]);

  return (
    <div className="mb-10 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        Export report
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/20 text-zinc-200"
          onClick={downloadJson}
        >
          Download JSON
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/20 text-zinc-200"
          onClick={downloadMd}
        >
          Download Markdown
        </Button>
      </div>
    </div>
  );
}
