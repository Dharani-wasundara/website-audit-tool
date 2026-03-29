"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { WEBAUDIT_URL_STORAGE_KEY } from "@/components/url-input";

export function ResultsClient() {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? sessionStorage.getItem(WEBAUDIT_URL_STORAGE_KEY)
        : null;
    if (!stored) {
      router.replace("/");
      return;
    }
    setUrl(stored);
  }, [router]);

  if (!url) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] font-mono text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-block font-mono text-sm text-[#00d4ff] hover:underline"
        >
          ← Back
        </Link>
        <h1 className="mb-2 font-mono text-lg text-zinc-100">Results</h1>
        <p className="mb-6 break-all font-mono text-sm text-zinc-500">
          {url}
        </p>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
          Full metrics grid and Gemini insights will run here next (scrape →
          extract → audit pipeline).
        </div>
      </div>
    </div>
  );
}
