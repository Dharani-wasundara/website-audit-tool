"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

const inputId = "audit-url";

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
      router.push(`/results?url=${encodeURIComponent(u.href)}`);
    } catch {
      setError("That doesn't look like a valid URL");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full [&_input:focus]:outline-none [&_input:focus-visible]:outline-none",
        className
      )}
    >
      <label htmlFor={inputId} className="sr-only">
        Page URL to audit
      </label>
      <div
        className={cn(
          "flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm",
          "transition-[border-color] duration-150",
          "focus-within:border-primary",
          "sm:flex-row sm:items-center sm:gap-0 sm:p-1.5 sm:pl-3"
        )}
      >
        <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 px-1 sm:px-0">
          <Globe
            className="size-[18px] shrink-0 text-primary"
            aria-hidden
          />
          <input
            id={inputId}
            type="text"
            name="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="audit-url-input min-w-0 flex-1 bg-transparent py-2 text-[15px] leading-normal text-zinc-900 placeholder:text-zinc-400 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:py-1.5 [caret-color:var(--primary)]"
          />
        </div>
        <Button
          type="submit"
          className="h-11 w-full shrink-0 rounded-lg border-0 bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-none hover:bg-[var(--primary-hover)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:ml-1 sm:h-10 sm:w-auto"
        >
          Run audit
        </Button>
      </div>
      {error ? (
        <p
          className="mt-2 text-center text-sm text-red-600 sm:text-left"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
