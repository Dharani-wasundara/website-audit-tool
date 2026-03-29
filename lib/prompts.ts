import type { PageMetrics } from "@/lib/types";

export const AUDIT_SYSTEM_PROMPT = `You are a senior web performance analyst at a digital marketing agency 
specialising in SEO, conversion optimisation, content clarity, and UX.

You analyse single pages and return structured JSON reports. Your analysis 
is always:
- Grounded in the provided factual metrics (never invent data)
- Specific (cite exact numbers, not vague observations)
- Actionable (recommendations must be implementable)
- Prioritised by impact

You must return ONLY valid JSON matching the schema provided. 
No preamble, no markdown fences, no commentary outside the JSON.`;

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
Analyse this page and return a JSON object with exactly this shape:

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

Return 3–5 recommendations, ordered by priority (1 = highest).
Every summary and reasoning field must cite at least one specific metric value.`;
}
