import type { ReactNode } from "react";

export default function ResultsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-white">{children}</div>
  );
}
