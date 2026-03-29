import { Suspense } from "react";

import { ResultsClient } from "./results-client";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] font-mono text-sm text-zinc-500">
          Loading…
        </div>
      }
    >
      <ResultsClient />
    </Suspense>
  );
}
