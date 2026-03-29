import { load } from "cheerio";

import type { FirecrawlMetadata, PageMetrics } from "@/lib/types";

/** Case-insensitive substring match for CTA heuristics. */
const CTA_PATTERN =
  /\b(get|started?|start|try|buy|book|download|sign\s*up|signup|contact|request|schedule)\b/i;

function normalizeHref(href: string, base: URL): URL | null {
  const t = href.trim();
  if (!t || t === "#" || t.toLowerCase().startsWith("mailto:")) {
    return null;
  }
  try {
    return new URL(t, base);
  } catch {
    return null;
  }
}

export function extractMetrics(html: string, pageUrl: string): PageMetrics {
  const $ = load(html);
  const base = new URL(pageUrl);

  $("script, style, noscript").remove();
  const bodyText = $("body").length ? $("body").text() : $.root().text();
  const wordCount = bodyText
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;

  const h1Count = $("h1").length;
  const h2Count = $("h2").length;
  const h3Count = $("h3").length;

  let ctaCount = 0;
  $("button, a").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text && CTA_PATTERN.test(text)) {
      ctaCount += 1;
    }
  });

  const internalHrefs = new Set<string>();
  const externalHrefs = new Set<string>();

  $("a[href]").each((_, el) => {
    const raw = $(el).attr("href");
    if (!raw) return;
    const resolved = normalizeHref(raw, base);
    if (!resolved) return;
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return;
    }
    const key = resolved.href;
    if (resolved.hostname === base.hostname) {
      internalHrefs.add(key);
    } else {
      externalHrefs.add(key);
    }
  });

  const totalImages = $("img").length;
  const imagesMissingAlt = $("img").filter((_, el) => {
    const alt = $(el).attr("alt");
    return alt === undefined || alt.trim() === "";
  }).length;

  const altTextMissingPct =
    totalImages === 0 ? 0 : (imagesMissingAlt / totalImages) * 100;

  const titleEl = $("title").first().text().trim();
  const metaTitle = titleEl || null;

  const metaDescRaw = $('meta[name="description"]').attr("content");
  const metaDescription =
    metaDescRaw && metaDescRaw.trim() ? metaDescRaw.trim() : null;

  return {
    wordCount,
    h1Count,
    h2Count,
    h3Count,
    ctaCount,
    internalLinks: internalHrefs.size,
    externalLinks: externalHrefs.size,
    totalImages,
    imagesMissingAlt,
    altTextMissingPct: Math.round(altTextMissingPct * 10) / 10,
    metaTitle,
    metaDescription,
    metaTitleLength: metaTitle ? metaTitle.length : 0,
    metaDescLength: metaDescription ? metaDescription.length : 0,
  };
}

/** When `<title>` / meta tags are missing in HTML, use Firecrawl metadata. */
export function applyMetadataFallback(
  metrics: PageMetrics,
  meta: Pick<FirecrawlMetadata, "title" | "description" | "ogTitle">
): PageMetrics {
  let next = { ...metrics };
  if (!next.metaTitle) {
    const t = meta.title?.trim() || meta.ogTitle?.trim();
    if (t) {
      next = {
        ...next,
        metaTitle: t,
        metaTitleLength: t.length,
      };
    }
  }
  if (!next.metaDescription && meta.description?.trim()) {
    const d = meta.description.trim();
    next = {
      ...next,
      metaDescription: d,
      metaDescLength: d.length,
    };
  }
  return next;
}
