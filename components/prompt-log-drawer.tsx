"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download-blob";
import type { PromptLog } from "@/lib/types";
import { outlineActionButtonClassName } from "@/lib/outline-action-button-class";
import { cn } from "@/lib/utils";

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {title}
      </p>
      <pre className="max-h-48 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-700">
        {children}
      </pre>
    </div>
  );
}

const panelId = "prompt-log-panel";

export function PromptLogDrawer({ log }: { log: PromptLog }) {
  const [open, setOpen] = useState(false);

  function download() {
    downloadBlob(
      JSON.stringify(log, null, 2),
      `webaudit-prompt-log-${log.timestamp.slice(0, 10)}.json`,
      "application/json"
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          id="prompt-log-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="group flex items-center gap-2 rounded-lg text-left text-sm font-medium text-zinc-700 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-primary transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:duration-0",
              open ? "rotate-0" : "-rotate-90"
            )}
            strokeWidth={2}
            aria-hidden
          />
          <span>Prompt log</span>
        </button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("shrink-0", outlineActionButtonClassName)}
          onClick={download}
        >
          Download JSON
        </Button>
      </div>
      <div
        id={panelId}
        role="region"
        aria-labelledby="prompt-log-toggle"
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-zinc-200 px-4 pb-4 pt-3">
            <Block title="System prompt">{log.systemPrompt}</Block>
            <Block title="User prompt">{log.userPrompt}</Block>
            <Block title="Raw model output">{log.rawModelOutput}</Block>
            <p className="text-[11px] text-zinc-500">
              Model: {log.model} · In: {log.inputTokens} tok · Out:{" "}
              {log.outputTokens} tok · {log.timestamp}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
