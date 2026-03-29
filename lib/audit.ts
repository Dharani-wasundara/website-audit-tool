import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";

import { getMockAuditResponse, shouldUseMockAudit } from "@/lib/audit-mock";
import { AUDIT_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import type { AuditInsights, AuditResponse, PageMetrics } from "@/lib/types";

function stripJsonFence(s: string): string {
  const t = s.trim();
  if (t.startsWith("```")) {
    return t
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```$/, "")
      .trim();
  }
  return t;
}

function isInsightSection(x: unknown): x is {
  score: number;
  summary: string;
  issues: string[];
} {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.score === "number" &&
    typeof o.summary === "string" &&
    Array.isArray(o.issues) &&
    o.issues.every((i) => typeof i === "string")
  );
}

function isRecommendation(x: unknown): x is AuditInsights["recommendations"][number] {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const effort = o.effort;
  const impact = o.impact;
  return (
    typeof o.priority === "number" &&
    typeof o.title === "string" &&
    typeof o.reasoning === "string" &&
    typeof o.metric_reference === "string" &&
    (effort === "low" || effort === "medium" || effort === "high") &&
    (impact === "low" || impact === "medium" || impact === "high")
  );
}

export function parseInsightsJson(raw: string): AuditInsights {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(raw));
  } catch {
    throw new Error("AI response was not valid JSON");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI response JSON was not an object");
  }
  const p = parsed as Record<string, unknown>;
  const keys = ["seo", "messaging", "cta", "ux", "contentDepth"] as const;
  for (const k of keys) {
    if (!isInsightSection(p[k])) {
      throw new Error(`Invalid or missing insights section: ${k}`);
    }
  }
  if (!Array.isArray(p.recommendations)) {
    throw new Error("Invalid recommendations array");
  }
  if (p.recommendations.length < 3 || p.recommendations.length > 5) {
    throw new Error("Recommendations must include between 3 and 5 items");
  }
  if (!p.recommendations.every(isRecommendation)) {
    throw new Error("Invalid recommendation object shape");
  }
  return parsed as AuditInsights;
}

const GEMINI_MAX_ATTEMPTS = 5;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parses "Please retry in 39.7s" or JSON retryDelay from Gemini error bodies. */
function parseRetryDelayMs(message: string): number | null {
  const inline = message.match(/retry in ([\d.]+)\s*s/i);
  if (inline) {
    const sec = parseFloat(inline[1]);
    if (!Number.isNaN(sec)) return Math.ceil(sec * 1000) + 1000;
  }
  const jsonRetry = message.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
  if (jsonRetry) {
    const sec = parseInt(jsonRetry[1], 10);
    if (!Number.isNaN(sec)) return sec * 1000 + 1000;
  }
  return null;
}

function backoffMs(attempt: number): number {
  return Math.min(2 ** (attempt - 1) * 2000, 60_000);
}

function computeWaitMs(error: unknown, attempt: number): number {
  const msg = error instanceof Error ? error.message : String(error);
  const apiHint = parseRetryDelayMs(msg);
  if (apiHint !== null) return Math.min(apiHint, 120_000);
  return backoffMs(attempt);
}

function isRetryableGeminiError(e: unknown): boolean {
  if (e instanceof GoogleGenerativeAIFetchError) {
    const s = e.status;
    return s === 429 || s === 503 || s === 500;
  }
  if (e instanceof Error) {
    return /\[429|\[503|\[500|RESOURCE_EXHAUSTED|UNAVAILABLE|Too Many Requests/i.test(
      e.message
    );
  }
  return false;
}

function isQuotaOrRateLimitFailure(e: unknown): boolean {
  if (e instanceof GoogleGenerativeAIFetchError && e.status === 429) return true;
  const msg = e instanceof Error ? e.message : String(e);
  return /429|quota|RESOURCE_EXHAUSTED|Too Many Requests/i.test(msg);
}

function isModelNotFoundError(e: unknown): boolean {
  if (e instanceof GoogleGenerativeAIFetchError && e.status === 404) return true;
  const msg = e instanceof Error ? e.message : String(e);
  return /404 Not Found|not found for API version|is not supported for generateContent/i.test(
    msg
  );
}

function friendlyGeminiFailureMessage(e: unknown): string {
  if (isModelNotFoundError(e)) {
    return [
      "That Gemini model ID is not available for this API (HTTP 404). Names like gemini-1.5-flash are often retired.",
      "Set GEMINI_MODEL=gemini-2.5-flash in .env.local, or delete GEMINI_MODEL to use the app default.",
      "Current model codes: https://ai.google.dev/gemini-api/docs/models/gemini",
    ].join(" ");
  }
  if (isQuotaOrRateLimitFailure(e)) {
    return [
      "Gemini returned rate limit or quota error (HTTP 429).",
      "Wait a minute and click Retry, or open Google AI Studio (https://aistudio.google.com/apikey) and confirm billing and API access for this key.",
      "Free tier has per-minute caps; the API may ask you to retry after a short delay.",
    ].join(" ");
  }
  if (e instanceof Error) return e.message;
  return String(e);
}

async function generateContentWithRetries(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  userPrompt: string
) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    try {
      return await model.generateContent(userPrompt);
    } catch (e) {
      lastError = e;
      if (!isRetryableGeminiError(e) || attempt === GEMINI_MAX_ATTEMPTS) break;
      await sleep(computeWaitMs(e, attempt));
    }
  }
  throw new Error(friendlyGeminiFailureMessage(lastError));
}

async function auditGemini(
  metrics: PageMetrics,
  markdown: string,
  url: string
): Promise<AuditResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const userPrompt = buildUserPrompt(url, metrics, markdown);
  const modelId = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: AUDIT_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      temperature: 0.4,
    },
  });

  const result = await generateContentWithRetries(model, userPrompt);
  const response = result.response;
  const text = response.text();
  const insights = parseInsightsJson(text);

  const meta = response.usageMetadata;
  const promptLog = {
    systemPrompt: AUDIT_SYSTEM_PROMPT,
    userPrompt,
    rawModelOutput: text,
    model: modelId,
    inputTokens: meta?.promptTokenCount ?? 0,
    outputTokens: meta?.candidatesTokenCount ?? 0,
    timestamp: new Date().toISOString(),
  };

  return { insights, promptLog };
}

export async function runAudit(input: {
  metrics: PageMetrics;
  markdown: string;
  url: string;
}): Promise<AuditResponse> {
  const { metrics, markdown, url } = input;

  if (shouldUseMockAudit()) {
    return getMockAuditResponse(metrics, url);
  }

  return auditGemini(metrics, markdown, url);
}
