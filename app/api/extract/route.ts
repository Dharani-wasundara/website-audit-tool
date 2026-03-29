import { NextResponse } from "next/server";

import { applyMetadataFallback, extractMetrics } from "@/lib/metrics";
import type { FirecrawlMetadata } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const html = body?.html;
    const pageUrl = body?.url;
    const metadata = body?.metadata as FirecrawlMetadata | undefined;

    if (typeof html !== "string") {
      return NextResponse.json({ error: "Missing html" }, { status: 400 });
    }
    if (typeof pageUrl !== "string" || !pageUrl.trim()) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    let metrics = extractMetrics(html, pageUrl.trim());
    if (metadata && typeof metadata === "object") {
      metrics = applyMetadataFallback(metrics, metadata);
    }
    return NextResponse.json(metrics);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Extract failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
