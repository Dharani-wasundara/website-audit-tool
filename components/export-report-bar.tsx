"use client";

import { useCallback } from "react";

import { BrandSectionHeading } from "@/components/brand-section-heading";
import { Button } from "@/components/ui/button";
import type { AuditResponse, FirecrawlMetadata, PageMetrics } from "@/lib/types";
import { outlineActionButtonClassName } from "@/lib/outline-action-button-class";
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
    <div className="mb-10 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5">
      <BrandSectionHeading as="h2" className="mb-2">
        Export report
      </BrandSectionHeading>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={outlineActionButtonClassName}
          onClick={downloadJson}
        >
          Download JSON
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={outlineActionButtonClassName}
          onClick={downloadMd}
        >
          Download Markdown
        </Button>
      </div>
    </div>
  );
}
