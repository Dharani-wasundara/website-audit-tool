import { UrlInputForm } from "@/components/url-input";

export default function Home() {
  return (
    <div className="bg-dot-grid relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#00d4ff]/[0.07] via-transparent to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 pb-24 pt-16">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#00d4ff]/90">
          WebAudit
        </p>
        <h1 className="mb-3 text-center text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Instant AI-powered website analysis
        </h1>
        <p className="mb-10 max-w-md text-center text-sm leading-relaxed text-zinc-400">
          Scrape the page, extract factual metrics, then get structured insights
          tied to those numbers.
        </p>

        <UrlInputForm />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {["SEO structure", "CTA analysis", "Content depth", "UX insights"].map(
            (label) => (
              <span
                key={label}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs text-zinc-500"
              >
                · {label}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
