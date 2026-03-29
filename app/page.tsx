import { BrandBackground } from "@/components/brand-background";
import { UrlInputForm } from "@/components/url-input";

export default function Home() {
  return (
    <div className="relative min-h-screen min-h-[100dvh]">
      <BrandBackground />

      <div className="relative z-10 mx-auto flex min-h-screen min-h-[100dvh] w-full min-w-0 max-w-2xl flex-col items-center justify-center px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
        <div
          className="mb-5 flex max-w-full flex-row flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-zinc-200 bg-white px-3 py-2 text-center text-[10px] font-medium text-zinc-600 shadow-sm sm:mb-6 sm:inline-flex sm:flex-nowrap sm:px-4 sm:py-2 sm:text-left sm:text-xs"
          role="note"
        >
          <span className="shrink-0 font-semibold tracking-wide text-primary">
            WebAudit
          </span>
          <span className="hidden h-3 w-px shrink-0 bg-zinc-200 sm:block" aria-hidden />
          <span className="shrink-0 sm:hidden">Audit · metrics · Gemini</span>
          <span className="hidden shrink-0 sm:inline">
            Single-page audit · metrics + Gemini
          </span>
        </div>

        <h1 className="mx-auto mb-4 w-full min-w-0 max-w-xl px-1 text-center text-2xl font-semibold tracking-tight text-balance text-zinc-900 sm:text-3xl sm:leading-snug md:text-4xl md:leading-tight">
          Turn any URL into{" "}
          <span className="text-primary">clean metrics</span>
          {" "}
          and structured AI insights.
        </h1>
        <p className="mx-auto mb-8 mt-1 max-w-md text-balance px-1 text-center text-sm leading-relaxed text-zinc-600 sm:mb-10 sm:mt-2 sm:px-0 sm:text-[15px]">
          We fetch the page, extract measurable signals, and run analysis so
          recommendations stay tied to what is actually on the page.
        </p>

        <div className="w-full min-w-0 max-w-xl">
          <UrlInputForm />
        </div>

        <div className="mt-8 flex w-full min-w-0 max-w-xl flex-wrap justify-center gap-2 sm:mt-10">
          {["SEO structure", "CTA analysis", "Content depth", "UX insights"].map(
            (label) => (
              <span
                key={label}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-600 sm:text-xs"
              >
                {label}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
