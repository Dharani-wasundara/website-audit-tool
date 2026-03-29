import { Suspense } from "react";

import { ResultsClient } from "./results-client";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-white px-4 text-sm text-zinc-600">
          Loading…
        </div>
      }
    >
      <ResultsClient />
    </Suspense>
  );
}
