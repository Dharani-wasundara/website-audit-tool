"use client";

import { useState } from "react";

import type { PromptLog } from "@/lib/types";

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        {title}
      </p>
      <pre className="max-h-48 overflow-auto rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-zinc-400">
        {children}
      </pre>
    </div>
  );
}

export function PromptLogDrawer({ log }: { log: PromptLog }) {
  const [open, setOpen] = useState(false);

  function download() {
    const blob = new Blob([JSON.stringify(log, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `webaudit-prompt-log-${log.timestamp.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-left font-mono text-sm text-zinc-400 hover:text-zinc-200"
        >
          {open ? "▼" : "▶"} Prompt log
        </button>
        <button
          type="button"
          onClick={download}
          className="shrink-0 font-mono text-sm text-[#00d4ff] hover:underline"
        >
          Download JSON
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/10 px-4 pb-4 pt-2">
          <Block title="System prompt">{log.systemPrompt}</Block>
          <Block title="User prompt">{log.userPrompt}</Block>
          <Block title="Raw model output">{log.rawModelOutput}</Block>
          <p className="font-mono text-[11px] text-zinc-600">
            Model: {log.model} · In: {log.inputTokens} tok · Out:{" "}
            {log.outputTokens} tok · {log.timestamp}
          </p>
        </div>
      ) : null}
    </div>
  );
}
