export interface PageMetrics {
  wordCount: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  ctaCount: number;
  internalLinks: number;
  externalLinks: number;
  totalImages: number;
  imagesMissingAlt: number;
  altTextMissingPct: number;
  metaTitle: string | null;
  metaDescription: string | null;
  metaTitleLength: number;
  metaDescLength: number;
}

export interface InsightSection {
  score: number;
  summary: string;
  issues: string[];
}

export interface Recommendation {
  priority: number;
  title: string;
  reasoning: string;
  metric_reference: string;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
}

export interface AuditInsights {
  seo: InsightSection;
  messaging: InsightSection;
  cta: InsightSection;
  ux: InsightSection;
  contentDepth: InsightSection;
  recommendations: Recommendation[];
}

export interface PromptLog {
  systemPrompt: string;
  userPrompt: string;
  rawModelOutput: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  timestamp: string;
}

export interface AuditResponse {
  insights: AuditInsights;
  promptLog: PromptLog;
}

export interface FirecrawlMetadata {
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  statusCode: number;
}

export interface ScrapeResponse {
  html: string;
  markdown: string;
  metadata: FirecrawlMetadata;
}

export type AuditStep =
  | "idle"
  | "scraping"
  | "extracting"
  | "analyzing"
  | "complete"
  | "error";
