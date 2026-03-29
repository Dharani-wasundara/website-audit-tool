import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  as?: "h2" | "h3";
  className?: string;
};

/**
 * Section titles without bullet markers — h2 = primary section, h3 = nested subsection.
 */
export function BrandSectionHeading({
  children,
  as: Tag = "h2",
  className,
}: Props) {
  return (
    <Tag
      className={cn(
        Tag === "h2"
          ? "mb-4 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl"
          : "mb-2 mt-5 border-t border-zinc-100 pt-3 text-xs font-semibold uppercase tracking-wider text-zinc-500",
        className
      )}
    >
      {children}
    </Tag>
  );
}
