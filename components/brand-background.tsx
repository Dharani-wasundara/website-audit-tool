"use client";

import dynamic from "next/dynamic";

const PixelBlast = dynamic(
  () => import("@/components/PixelBlast/PixelBlast"),
  { ssr: false }
);

/**
 * Full-viewport PixelBlast layer for the home page only. Keeps default shader tint
 * (do not tie to `--primary`); content sits above in `z-10`.
 */
export function BrandBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 min-h-[100dvh] w-full opacity-[30%]"
      aria-hidden
    >
      <PixelBlast className="h-full w-full" transparent speed={0.35} />
    </div>
  );
}
