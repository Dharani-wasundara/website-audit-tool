import type {
  AuditInsights,
  AuditResponse,
  FirecrawlMetadata,
  PageMetrics,
  PromptLog,
} from "@/lib/types";

export type AuditExportPayload = {
  version: 1;
  exportedAt: string;
  url: string;
  fetchMetadata: Pick<
    FirecrawlMetadata,
    "title" | "description" | "ogTitle" | "statusCode"
  > | null;
  metrics: PageMetrics;
  insights: AuditInsights;
  promptLog: PromptLog;
};

export function buildAuditExportPayload(input: {
  url: string;
  metrics: PageMetrics;
  audit: AuditResponse;
  fetchMetadata?: Pick<
    FirecrawlMetadata,
    "title" | "description" | "ogTitle" | "statusCode"
  > | null;
}): AuditExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    url: input.url,
    fetchMetadata: input.fetchMetadata ?? null,
    metrics: input.metrics,
    insights: input.audit.insights,
    promptLog: input.audit.promptLog,
  };
}

/** Builds a Markdown fence that cannot be closed by `body` (handles ``` inside prompts). */
function fencedBlock(body: string): string {
  let fence = "```";
  while (body.includes(fence)) {
    fence = "`" + fence;
  }
  return `${fence}text\n${body}\n${fence}`;
}

type InsightKey = keyof Omit<AuditInsights, "recommendations">;

function sectionInsight(title: string, key: InsightKey, insights: AuditInsights): string {
  const s = insights[key];
  const lines = [
    `## ${title}`,
    "",
    `**Score:** ${s.score}/10`,
    "",
    s.summary,
    "",
    "**Issues:**",
    ...s.issues.map((issue) => `- ${issue.replace(/\n/g, " ")}`),
    "",
  ];
  return lines.join("\n");
}

export function auditExportToMarkdown(payload: AuditExportPayload): string {
  const { url, exportedAt, fetchMetadata, metrics, insights, promptLog } =
    payload;

  const metaLines: string[] = [
    "# Website audit report",
    "",
    `- **URL:** ${url}`,
    `- **Exported:** ${exportedAt}`,
    "",
  ];

  if (fetchMetadata) {
    metaLines.push("## Fetch metadata", "");
    metaLines.push(
      `- **HTTP status:** ${fetchMetadata.statusCode}`,
      `- **Title (crawl):** ${fetchMetadata.title ?? "(none)"}`,
      `- **OG title:** ${fetchMetadata.ogTitle ?? "(none)"}`,
      `- **Description (crawl):** ${fetchMetadata.description ?? "(none)"}`,
      ""
    );
  }

  const m = metrics;
  const factual = [
    "## Factual metrics",
    "",
    `- **Word count:** ${m.wordCount}`,
    `- **Headings (H1 / H2 / H3):** ${m.h1Count} / ${m.h2Count} / ${m.h3Count}`,
    `- **CTAs (heuristic):** ${m.ctaCount}`,
    `- **Internal / external links:** ${m.internalLinks} / ${m.externalLinks}`,
    `- **Images:** ${m.totalImages} (${m.imagesMissingAlt} missing alt, ${m.altTextMissingPct.toFixed(1)}% missing)`,
    `- **Meta title (${m.metaTitleLength} chars):** ${m.metaTitle ?? "(none)"}`,
    `- **Meta description (${m.metaDescLength} chars):** ${m.metaDescription ?? "(none)"}`,
    "",
  ].join("\n");

  const recs = [...insights.recommendations].sort(
    (a, b) => a.priority - b.priority
  );
  const recBlock = [
    "## Recommendations",
    "",
    ...recs.map((r, i) => {
      const titleLine = `${i + 1}. ${r.title.replace(/\n/g, " ")} (priority ${r.priority}, ${r.impact} impact, ${r.effort} effort)`;
      const ref = String(r.metric_reference).replace(/`/g, "'");
      return [
        titleLine,
        "",
        r.reasoning,
        "",
        `*Based on:* \`${ref}\``,
        "",
      ].join("\n");
    }),
  ].join("\n");

  const insightBlocks = [
    sectionInsight("SEO", "seo", insights),
    sectionInsight("Messaging", "messaging", insights),
    sectionInsight("CTA", "cta", insights),
    sectionInsight("UX", "ux", insights),
    sectionInsight("Content depth", "contentDepth", insights),
  ].join("\n");

  const appendix = [
    "## Prompt log (appendix)",
    "",
    "### System prompt",
    "",
    fencedBlock(promptLog.systemPrompt),
    "",
    "### User prompt",
    "",
    fencedBlock(promptLog.userPrompt),
    "",
    "### Raw model output",
    "",
    fencedBlock(promptLog.rawModelOutput),
    "",
    `*Model:* ${promptLog.model} · *In:* ${promptLog.inputTokens} tok · *Out:* ${promptLog.outputTokens} tok · *Time:* ${promptLog.timestamp}`,
    "",
  ].join("\n");

  return [
    ...metaLines,
    factual,
    insightBlocks,
    recBlock,
    appendix,
  ].join("\n");
}

export function getExportFilename(url: string, ext: string): string {
  let host = "page";
  try {
    host = new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    /* ignore */
  }
  const day = new Date().toISOString().slice(0, 10);
  const safe = host.replace(/[^a-zA-Z0-9._-]+/g, "-");
  return `website-audit-${safe}-${day}.${ext}`;
}
