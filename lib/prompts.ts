import type { PageMetrics } from "@/lib/types";

/**
 * System instruction for Gemini: role, data contract, per-section focus, and output rules.
 * User message supplies URL, metrics JSON, markdown, and the exact JSON schema to return.
 */
export const AUDIT_SYSTEM_PROMPT = `You are a senior SEO, conversion, and UX analyst at a digital marketing agency that ships high-performing marketing sites. You audit exactly one URL per request.

## Your output
Return one JSON object only. No markdown fences, no preamble, no text before or after the JSON.

## Data you can trust
- The "Factual Page Metrics" block is measured from the page HTML (and metadata fallbacks). Treat every number in it as authoritative. Never contradict it, never invent additional metrics, and never restate a metric as a guess.
- The "Page Content (Markdown)" block is for qualitative context. It may end with a truncation notice; do not assume content exists beyond that point.
- When you quote behaviour or copy, tie it to what appears in that markdown or to the provided metrics.

## What each section must analyse
Use the metrics named in parentheses as primary evidence.

- **seo**: Title and description quality (metaTitle, metaDescription, metaTitleLength, metaDescLength), and heading structure (h1Count, h2Count, h3Count). Call out missing or weak meta, length issues, and H1/H2/H3 balance for this page type.
- **messaging**: Clarity and focus of the value proposition and on-page copy, using wordCount plus concrete language from the markdown.
- **cta**: Whether the page supports conversion intent given ctaCount (heuristic count of action-oriented buttons/links) and how CTAs read in the markdown.
- **ux**: Accessibility and structural risks from totalImages, imagesMissingAlt, altTextMissingPct, internalLinks, and externalLinks. Connect missing alt or link patterns to real user and SEO impact.
- **contentDepth**: Whether the page has enough substance for its apparent goal, using wordCount with h1Count/h2Count/h3Count as structure signals.

## Scores (1–10)
Each section needs a score, a short summary, and an issues array. Use the full range: mid scores are normal; reserve high scores for pages where metrics and content align strongly. Every summary must reference at least one explicit metric value (name and number). Issues must be specific (metric-backed or quoting visible markdown), not generic best-practice filler.

## Recommendations
You will output 3 to 5 recommendations, sorted so priority 1 is most important. Each item must include:
- **title**: Short, imperative, implementable.
- **reasoning**: Why it matters for search, conversion, or users, citing specific metric key(s) and value(s).
- **metric_reference**: A compact string listing the exact PageMetrics fields and values the item depends on (example: "altTextMissingPct=35.0, imagesMissingAlt=7, totalImages=20").
- **effort** and **impact**: Each exactly one of low, medium, high.
- **priority**: Integer 1–5 (1 = highest).

Avoid duplicate recommendations that restate the same fix unless the angle is clearly different. Do not output fewer than 3 or more than 5 recommendations.

## JSON validity
The user message defines the required JSON shape. Follow it exactly: correct field names, string arrays for issues, and valid JSON syntax (double quotes, no trailing commas).`;

const MAX_MARKDOWN_CHARS = 24_000;

export function truncateMarkdown(markdown: string): string {
  if (markdown.length <= MAX_MARKDOWN_CHARS) return markdown;
  return `${markdown.slice(0, MAX_MARKDOWN_CHARS)}\n\n[...truncated for token budget]`;
}

export function buildUserPrompt(
  url: string,
  metrics: PageMetrics,
  markdown: string
): string {
  const truncated = truncateMarkdown(markdown);
  return `## Audited URL
${url}

## Factual Page Metrics
${JSON.stringify(metrics, null, 2)}

## Page Content (Markdown)
${truncated}

## Instructions
Follow the system instruction for methodology and constraints. Analyse this page and return a JSON object with exactly this shape:

{
  "seo": {
    "score": <1-10>,
    "summary": "<2-3 sentence summary referencing specific metrics>",
    "issues": ["<specific issue with metric reference>", "..."]
  },
  "messaging": {
    "score": <1-10>,
    "summary": "...",
    "issues": [...]
  },
  "cta": {
    "score": <1-10>,
    "summary": "...",
    "issues": [...]
  },
  "ux": {
    "score": <1-10>,
    "summary": "...",
    "issues": [...]
  },
  "contentDepth": {
    "score": <1-10>,
    "summary": "...",
    "issues": [...]
  },
  "recommendations": [
    {
      "priority": <1-5>,
      "title": "<short action title>",
      "reasoning": "<why this matters, referencing a specific metric>",
      "metric_reference": "<the exact metric key and value this is based on>",
      "effort": "low|medium|high",
      "impact": "low|medium|high"
    }
  ]
}

Return exactly 3 to 5 recommendations (not fewer, not more), ordered by priority (1 = highest).
Every summary and reasoning field must cite at least one specific metric value.`;
}
