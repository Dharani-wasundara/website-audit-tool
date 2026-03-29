"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "webaudit:url";

function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function UrlInputForm({ className }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const candidate = normalizeUrl(value);
    if (!candidate) {
      setError("Enter a URL");
      return;
    }
    try {
      const u = new URL(candidate);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        setError("URL must start with http:// or https://");
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, u.href);
      router.push("/results");
    } catch {
      setError("That doesn’t look like a valid URL");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full max-w-xl", className)}>
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-stretch",
          "rounded-xl border border-white/10 bg-black/40 p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm",
          "focus-within:border-[#00d4ff]/40 focus-within:shadow-[0_0_0_1px_rgba(0,212,255,0.2)]"
        )}
      >
        <label className="relative flex min-h-11 flex-1 items-center gap-2 px-3">
          <Link2
            className="size-4 shrink-0 text-[#00d4ff]/80"
            aria-hidden
          />
          <input
            type="text"
            name="url"
            autoComplete="url"
            placeholder="https://example.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
        </label>
        <Button
          type="submit"
          className="h-11 shrink-0 rounded-lg bg-[#00d4ff] px-6 font-mono text-sm font-semibold text-[#0a0a0a] hover:bg-[#33ddff]"
        >
          Analyse URL
        </Button>
      </div>
      {error ? (
        <p className="mt-2 text-center text-sm text-red-400 sm:text-left" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export { STORAGE_KEY as WEBAUDIT_URL_STORAGE_KEY };
