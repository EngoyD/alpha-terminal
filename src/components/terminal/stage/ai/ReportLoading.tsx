"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { hashString, mulberry32 } from "@/lib/random";
import type { Company } from "@/lib/types";
import { MIN_REPORT_MS } from "../../TerminalProvider";

interface Step {
  at: number;
  text: string;
  result: string;
}

function buildSteps(company: Company, model: string): Step[] {
  const rand = mulberry32(hashString(`${company.profile.ticker}:pipeline`));
  const n = (min: number, max: number) => Math.round(min + rand() * (max - min));
  const f = company.fundamentals;
  const biotech = company.profile.kind === "clinical-biotech";
  return [
    { at: 0, text: `Resolving EDGAR entity · ${company.profile.name}`, result: "ok" },
    { at: 380, text: `Fetching ${f.annualReport} · ${f.form} ${f.period} · 8-K ×${n(2, 7)}`, result: `${(1.2 + rand() * 4).toFixed(1)} MB` },
    { at: 900, text: "Parsing Item 1A · Risk Factors", result: `${n(24, 61)} sections` },
    {
      at: 1450,
      text: biotech ? "Indexing trial registry and FDA correspondence" : "Embedding latest earnings-call transcript",
      result: `${n(300, 1400)} chunks`,
    },
    { at: 2000, text: "Scoring moat durability against peer set", result: "done" },
    { at: 2500, text: "Mapping catalysts to calendar (next 180d)", result: `${n(3, 6)} events` },
    { at: 2950, text: `Synthesizing thesis · ${model}`, result: "" },
  ];
}

/** Terminal-style progress log shown while the report request is in flight. */
export function ReportLoading({ company, startedAt, model }: { company: Company; startedAt: number; model: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 90);
    return () => clearInterval(id);
  }, [startedAt]);

  const steps = useMemo(() => buildSteps(company, model), [company, model]);
  const visible = steps.filter((s) => s.at <= elapsed);
  const progress = Math.min(0.96, elapsed / MIN_REPORT_MS);

  return (
    <div role="status" aria-label={`Generating AI report for ${company.profile.ticker}`} className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-purple-500/20 bg-gray-950/80 p-3 font-mono text-[11px] leading-[1.8] shadow-[inset_0_0_40px_-20px] shadow-purple-500/30">
        <div className="truncate text-gray-400">
          <span className="text-purple-300">$</span> alpha-ai report --ticker {company.profile.ticker} --schema AIReport
        </div>
        {visible.map((step, i) => {
          const done = i < steps.length - 1 && steps[i + 1].at <= elapsed;
          return (
            <div key={step.text} className="flex animate-fade-in items-center gap-2">
              {done ? (
                <Check aria-hidden className="size-3 shrink-0 text-emerald-400" />
              ) : (
                <LoaderCircle aria-hidden className="size-3 shrink-0 animate-spin text-purple-300" />
              )}
              <span className={done ? "min-w-0 truncate text-gray-300" : "min-w-0 truncate text-purple-100"}>{step.text}</span>
              {done && step.result && <span className="ml-auto shrink-0 pl-2 text-gray-400">{step.result}</span>}
            </div>
          );
        })}
        <span aria-hidden className="mt-1 inline-block h-3.5 w-2 animate-blink bg-purple-300" />
      </div>

      <div>
        <div className="flex justify-between font-mono text-[10px] text-gray-400 tabular-nums">
          <span>{Math.round(progress * 100)}%</span>
          <span>{(elapsed / 1000).toFixed(1)}s</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-purple-500 to-fuchsia-400 transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
