import { NextResponse } from "next/server";

import { runAudit } from "@/lib/audit";
import type { PageMetrics } from "@/lib/types";

export const maxDuration = 60;

function isPageMetrics(x: unknown): x is PageMetrics {
  if (!x || typeof x !== "object") return false;
  const m = x as Record<string, unknown>;
  const nums = [
    "wordCount",
    "h1Count",
    "h2Count",
    "h3Count",
    "ctaCount",
    "internalLinks",
    "externalLinks",
    "totalImages",
    "imagesMissingAlt",
    "altTextMissingPct",
    "metaTitleLength",
    "metaDescLength",
  ];
  for (const k of nums) {
    if (typeof m[k] !== "number") return false;
  }
  return (
    (m.metaTitle === null || typeof m.metaTitle === "string") &&
    (m.metaDescription === null || typeof m.metaDescription === "string")
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { metrics, markdown, url } = body as {
      metrics?: unknown;
      markdown?: unknown;
      url?: unknown;
    };

    if (typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "Missing or invalid url" }, { status: 400 });
    }
    if (typeof markdown !== "string") {
      return NextResponse.json({ error: "Missing markdown" }, { status: 400 });
    }
    if (!isPageMetrics(metrics)) {
      return NextResponse.json({ error: "Missing or invalid metrics" }, { status: 400 });
    }

    const result = await runAudit({
      metrics,
      markdown,
      url: url.trim(),
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Audit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
