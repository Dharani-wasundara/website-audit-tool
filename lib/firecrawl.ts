import Firecrawl from "@mendable/firecrawl-js";

import type { ScrapeResponse } from "@/lib/types";

const SCRAPE_TIMEOUT_MS = 30_000;

export async function scrapePage(url: string): Promise<ScrapeResponse> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not configured");
  }

  const app = new Firecrawl({
    apiKey,
    timeoutMs: SCRAPE_TIMEOUT_MS,
  });

  const doc = await app.scrape(url, {
    formats: ["markdown", "html"],
    onlyMainContent: false,
    timeout: SCRAPE_TIMEOUT_MS,
  });

  const html = doc.html ?? "";
  const markdown = doc.markdown ?? "";
  const meta = doc.metadata ?? {};
  const statusCode =
    typeof meta.statusCode === "number" && !Number.isNaN(meta.statusCode)
      ? meta.statusCode
      : 200;

  return {
    html,
    markdown,
    metadata: {
      title: meta.title ?? null,
      description: meta.description ?? null,
      ogTitle: meta.ogTitle ?? null,
      statusCode,
    },
  };
}
