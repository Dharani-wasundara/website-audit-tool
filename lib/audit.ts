import { GoogleGenerativeAI } from "@google/generative-ai";

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
  if (!Array.isArray(p.recommendations) || p.recommendations.length < 1) {
    throw new Error("Invalid recommendations array");
  }
  if (!p.recommendations.every(isRecommendation)) {
    throw new Error("Invalid recommendation object shape");
  }
  return parsed as AuditInsights;
}

async function auditGemini(
  metrics: PageMetrics,
  markdown: string,
  url: string
): Promise<AuditResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const userPrompt = buildUserPrompt(url, metrics, markdown);
  const modelId = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

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

  const result = await model.generateContent(userPrompt);
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
