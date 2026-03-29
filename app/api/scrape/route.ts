import { NextResponse } from "next/server";

import { scrapePage } from "@/lib/firecrawl";
import { assertHttpUrl } from "@/lib/url";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const raw = body?.url;
    if (typeof raw !== "string" || !raw.trim()) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }
    const url = assertHttpUrl(raw);
    const data = await scrapePage(url);
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Scrape failed";
    const isClient =
      message === "Invalid URL" || message.startsWith("URL must use");
    return NextResponse.json(
      { error: message },
      { status: isClient ? 400 : 500 }
    );
  }
}
