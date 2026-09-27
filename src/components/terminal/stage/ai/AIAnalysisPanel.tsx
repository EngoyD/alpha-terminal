"use client";

import { BrainCircuit, CircleAlert, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";
import { cn } from "@/lib/format";
import type { Company } from "@/lib/types";
import { useTerminal } from "../../TerminalProvider";
import { Panel } from "../../ui/Panel";
import { Kbd } from "../../ui/primitives";
import { ReportLoading } from "./ReportLoading";
import { ReportView } from "./ReportView";
import { SECTIONS, type SectionKey } from "./sections";

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

function IdleState({ company, model, onGenerate }: { company: Company; model?: string; onGenerate: () => void }) {
  const f = company.fundamentals;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-6 text-center">
      <div className="grid size-14 place-items-center rounded-xl border border-purple-400/30 bg-purple-500/10 shadow-[0_0_48px_-10px] shadow-purple-500/60">
        <BrainCircuit aria-hidden className="size-7 text-purple-300" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-100">No AI report for {company.profile.ticker} yet</h3>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-gray-400">
          Synthesizes the {f.annualReport}, the latest {f.form}, earnings commentary and the news tape into a structured thesis.
        </p>
      </div>
      <button
        type="button"
        onClick={onGenerate}
        className="inline-flex items-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/15 px-4 py-2 text-sm font-medium text-purple-50 shadow-[0_0_28px_-8px] shadow-purple-500/70 transition hover:bg-purple-500/25 focus-visible:outline-2 focus-visible:outline-purple-400"
      >
        <Sparkles aria-hidden className="size-4" />
        Generate AI Report
        <Kbd className="border-purple-400/30 bg-purple-500/10 text-purple-200">G</Kbd>
      </button>
      <ul className="grid w-full max-w-xs gap-1.5 text-left">
        {SECTIONS.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2 rounded border border-gray-800 bg-gray-950/40 px-2.5 py-1.5 text-[11px] text-gray-400">
            <span className="font-mono text-[10px] text-purple-300">{i + 1}</span>
            <s.Icon aria-hidden className="size-3.5 text-purple-300/80" />
            {s.title}
          </li>
        ))}
      </ul>
      {model && <p className="font-mono text-[10px] text-gray-400">model: {model}</p>}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <CircleAlert aria-hidden className="size-7 text-red-400" />
      <div>
        <h3 className="text-sm font-semibold text-gray-100">Report generation failed</h3>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-gray-400">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-700 px-3 py-1.5 text-xs text-gray-200 hover:bg-gray-800"
      >
        <RefreshCw aria-hidden className="size-3.5" />
        Retry
      </button>
    </div>
  );
}

export function AIAnalysisPanel({ company, className }: { company: Company; className?: string }) {
  const { ticker } = company.profile;
  const { reports, generateReport, aiInfo } = useTerminal();
  const state = reports[ticker];
  const [tab, setTab] = useState<SectionKey>("moat");
  // Reports whose summary has already been typed out, so revisits render instantly.
  const [typed, setTyped] = useState<Set<string>>(() => new Set());

  // 1 / 2 / 3 switch sections while a report is on screen.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (state?.status !== "ready" || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    const section = SECTIONS[Number(e.key) - 1];
    if (section) setTab(section.key);
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const model = state?.status === "ready" ? state.envelope.meta.model : (aiInfo?.model ?? "alpha-mock-v2");
  const reportKey = state?.status === "ready" ? `${ticker}:${state.envelope.meta.generatedAt}` : "";

  return (
    <Panel
      code="AI"
      title="Fundamental Intelligence"
      icon={BrainCircuit}
      accent="purple"
      className={className}
      bodyClassName="flex flex-col"
      actions={
        <>
          <span className="hidden max-w-32 truncate font-mono text-[10px] text-purple-300/90 sm:inline">{model}</span>
          {state && state.status !== "loading" && (
            <button
              type="button"
              onClick={() => generateReport(ticker)}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium text-purple-200 hover:bg-purple-500/15"
            >
              <RefreshCw aria-hidden className="size-3" />
              Regenerate
            </button>
          )}
        </>
      }
    >
      <div aria-live="polite" className="sr-only">
        {state?.status === "ready" ? `AI report ready for ${ticker}` : state?.status === "error" ? `AI report failed for ${ticker}` : ""}
      </div>
      <div key={ticker} className={cn("flex min-h-0 flex-1 flex-col", state?.status !== "loading" && "animate-fade-in")}>
        {!state && <IdleState company={company} model={aiInfo?.model} onGenerate={() => generateReport(ticker)} />}
        {state?.status === "loading" && <ReportLoading company={company} startedAt={state.startedAt} model={model} />}
        {state?.status === "error" && <ErrorState message={state.error} onRetry={() => generateReport(ticker)} />}
        {state?.status === "ready" && (
          <ReportView
            key={reportKey}
            envelope={state.envelope}
            tab={tab}
            onTab={setTab}
            animate={!typed.has(reportKey)}
            onTyped={() => setTyped((s) => new Set(s).add(reportKey))}
          />
        )}
      </div>
    </Panel>
  );
}
