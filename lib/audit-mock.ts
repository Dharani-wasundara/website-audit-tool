import type {
  AuditInsights,
  AuditResponse,
  PageMetrics,
  Recommendation,
} from "@/lib/types";

/**
 * Use mock AI output when no LLM key is configured or MOCK_AUDIT is enabled.
 * Insights still cite real metric values so the UI and flow stay testable without an API.
 */
export function shouldUseMockAudit(): boolean {
  if (process.env.MOCK_AUDIT === "true" || process.env.MOCK_AUDIT === "1") {
    return true;
  }
  return !process.env.GEMINI_API_KEY?.trim();
}

function clampScore(n: number): number {
  return Math.max(1, Math.min(10, Math.round(n)));
}

export function getMockAuditResponse(
  metrics: PageMetrics,
  url: string
): AuditResponse {
  const seoIssues: string[] = [];
  if (!metrics.metaDescription) {
    seoIssues.push("No meta description (metaDescription is null)");
  }
  if (metrics.metaTitleLength > 60 || metrics.metaTitleLength < 30) {
    seoIssues.push(
      `Meta title length is ${metrics.metaTitleLength} chars (typical target ~30-60)`
    );
  }
  if (metrics.metaDescLength > 160 || (metrics.metaDescLength > 0 && metrics.metaDescLength < 70)) {
    seoIssues.push(
      `Meta description length is ${metrics.metaDescLength} chars (typical target ~70-160)`
    );
  }
  if (metrics.h1Count !== 1) {
    seoIssues.push(`H1 count is ${metrics.h1Count} (often 1 per page)`);
  }
  if (seoIssues.length === 0) {
    seoIssues.push("Core meta and heading signals look reasonable from extracted metrics.");
  }

  const seoScore = clampScore(
    7 -
      (metrics.metaDescription ? 0 : 2) -
      (metrics.metaTitleLength >= 30 && metrics.metaTitleLength <= 60 ? 0 : 1) -
      (metrics.imagesMissingAlt / Math.max(metrics.totalImages, 1)) * 2
  );

  const ctaIssues: string[] = [];
  if (metrics.ctaCount === 0) {
    ctaIssues.push("ctaCount is 0: no obvious CTAs matched keyword heuristics");
  } else {
    ctaIssues.push(`ctaCount is ${metrics.ctaCount} (keyword-matched buttons/links)`);
  }

  const recommendations: Recommendation[] = [
    {
      priority: 1,
      title: metrics.metaDescription ? "Tune meta description length" : "Add a meta description",
      reasoning: metrics.metaDescription
        ? `metaDescLength is ${metrics.metaDescLength}; adjust toward ~140-160 characters for many SERP snippets.`
        : "metaDescription is null: search snippets often pull missing or poor fallback text.",
      metric_reference: metrics.metaDescription
        ? `metaDescLength=${metrics.metaDescLength}`
        : "metaDescription=null",
      effort: "low",
      impact: "high",
    },
    {
      priority: 2,
      title: "Improve image alt coverage",
      reasoning: `altTextMissingPct=${metrics.altTextMissingPct.toFixed(1)} (imagesMissingAlt=${metrics.imagesMissingAlt}, totalImages=${metrics.totalImages})`,
      metric_reference: `imagesMissingAlt=${metrics.imagesMissingAlt}`,
      effort: "medium",
      impact: "medium",
    },
    {
      priority: 3,
      title: "Review internal vs external linking",
      reasoning: `internalLinks=${metrics.internalLinks}, externalLinks=${metrics.externalLinks}`,
      metric_reference: `internalLinks=${metrics.internalLinks}`,
      effort: "low",
      impact: "medium",
    },
    {
      priority: 4,
      title: "Align heading hierarchy with content",
      reasoning: `Heading counts H1/H2/H3 = ${metrics.h1Count}/${metrics.h2Count}/${metrics.h3Count}: ensure one clear H1 and logical sectioning for scanners and users.`,
      metric_reference: `h1Count=${metrics.h1Count}, h2Count=${metrics.h2Count}, h3Count=${metrics.h3Count}`,
      effort: "medium",
      impact: "medium",
    },
    {
      priority: 5,
      title: "Calibrate body depth to intent",
      reasoning: `wordCount=${metrics.wordCount}: thin or dense copy should match landing vs long-form intent; pair with ctaCount=${metrics.ctaCount}.`,
      metric_reference: `wordCount=${metrics.wordCount}`,
      effort: "low",
      impact: "low",
    },
  ];

  const insights: AuditInsights = {
    seo: {
      score: seoScore,
      summary: `Based on extracted metrics: meta title length ${metrics.metaTitleLength}, meta description ${metrics.metaDescription ? `present (${metrics.metaDescLength} chars)` : "missing"}, ${metrics.h1Count} H1, ${metrics.h2Count} H2, ${metrics.h3Count} H3.`,
      issues: seoIssues,
    },
    messaging: {
      score: clampScore(6),
      summary: `Page has ${metrics.wordCount} words after stripping (wordCount). Use this as a baseline for clarity and offer alignment.`,
      issues: [
        `wordCount=${metrics.wordCount}: review hero and value prop density vs this length`,
      ],
    },
    cta: {
      score: clampScore(metrics.ctaCount > 0 ? 7 : 4),
      summary: `Detected ctaCount=${metrics.ctaCount} using CTA keyword heuristics on buttons and links.`,
      issues: ctaIssues,
    },
    ux: {
      score: clampScore(7 - metrics.altTextMissingPct / 25),
      summary: `Images: totalImages=${metrics.totalImages}, imagesMissingAlt=${metrics.imagesMissingAlt}, altTextMissingPct=${metrics.altTextMissingPct.toFixed(1)}%.`,
      issues: [
        metrics.totalImages === 0
          ? "totalImages=0: no <img> elements in HTML"
          : `${metrics.imagesMissingAlt} of ${metrics.totalImages} images missing or empty alt (${metrics.altTextMissingPct.toFixed(1)}%)`,
      ],
    },
    contentDepth: {
      score: clampScore(5 + Math.min(4, Math.floor(metrics.wordCount / 500))),
      summary: `wordCount=${metrics.wordCount} with heading counts H1/H2/H3 = ${metrics.h1Count}/${metrics.h2Count}/${metrics.h3Count}.`,
      issues: [
        metrics.wordCount < 300
          ? "wordCount under 300: thin content for many landing pages"
          : `At ${metrics.wordCount} words, depth depends on page intent`,
      ],
    },
    recommendations,
  };

  const rawModelOutput = JSON.stringify(insights, null, 2);

  const promptLog = {
    systemPrompt: "[MOCK MODE: no Gemini request was sent]",
    userPrompt: `[MOCK MODE]\nURL: ${url}\n\nMetrics:\n${JSON.stringify(metrics, null, 2)}`,
    rawModelOutput,
    model: "mock-local",
    inputTokens: 0,
    outputTokens: 0,
    timestamp: new Date().toISOString(),
  };

  return { insights, promptLog };
}
