"use client";

import { FileText, Minus, Newspaper, Radio, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNow } from "@/hooks/useNow";
import { cn, fmtAgo } from "@/lib/format";
import type { Company, NewsItem, Sentiment } from "@/lib/types";
import { BOOT_TIME, useTerminal } from "../TerminalProvider";
import { Panel } from "../ui/Panel";
import { SentimentBadge, upDownClass } from "../ui/primitives";

type Filter = "all" | NewsItem["kind"];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "news", label: "News" },
  { key: "filing", label: "SEC" },
  { key: "flow", label: "Tape" },
];

const KIND_ICON: Record<NewsItem["kind"], LucideIcon> = { news: Newspaper, filing: FileText, flow: Radio };

function staticItems(company: Company): NewsItem[] {
  return company.news.map((n, i) => ({
    id: `${company.profile.ticker}-${i}`,
    kind: n.kind,
    source: n.source,
    headline: n.headline,
    sentiment: n.sentiment,
    formType: n.formType,
    ts: BOOT_TIME - n.minutesAgo * 60_000,
  }));
}

/** Diverging split of headline sentiment: bearish, neutral, bullish. */
function SentimentSplit({ items }: { items: NewsItem[] }) {
  const counts: Record<Sentiment, number> = { bearish: 0, neutral: 0, bullish: 0 };
  for (const item of items) counts[item.sentiment] += 1;
  const net = items.length ? (counts.bullish - counts.bearish) / items.length : 0;
  const segments: { key: Sentiment; className: string }[] = [
    { key: "bearish", className: "bg-red-400" },
    { key: "neutral", className: "bg-gray-500" },
    { key: "bullish", className: "bg-emerald-400" },
  ];
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-gray-800/80 px-3 py-1.5 text-[10.5px]">
      <span className="text-gray-400">Sentiment</span>
      <div
        role="img"
        aria-label={`${counts.bullish} bullish, ${counts.neutral} neutral, ${counts.bearish} bearish`}
        className="flex h-1.5 min-w-8 flex-1 gap-0.5 overflow-hidden rounded-full bg-gray-800"
      >
        {segments.map(
          (s) => counts[s.key] > 0 && <span key={s.key} className={cn("h-full", s.className)} style={{ flex: `${counts[s.key]} 1 0%` }} />,
        )}
      </div>
      <span className="inline-flex items-center gap-0.5 font-mono text-red-300">
        <TrendingDown aria-hidden className="size-3" />
        {counts.bearish}
      </span>
      <span className="inline-flex items-center gap-0.5 font-mono text-gray-300">
        <Minus aria-hidden className="size-3" />
        {counts.neutral}
      </span>
      <span className="inline-flex items-center gap-0.5 font-mono text-emerald-300">
        <TrendingUp aria-hidden className="size-3" />
        {counts.bullish}
      </span>
      <span className={cn("hidden font-mono font-semibold sm:inline", upDownClass(net))}>
        Net {net > 0 ? "+" : net < 0 ? "−" : ""}
        {Math.abs(net).toFixed(2)}
      </span>
    </div>
  );
}

export function NewsFeed({ company, className }: { company: Company; className?: string }) {
  const { ticker } = company.profile;
  const { wire } = useTerminal();
  const now = useNow();
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo(
    () => [...(wire[ticker] ?? []), ...staticItems(company)].sort((a, b) => b.ts - a.ts),
    [wire, ticker, company],
  );
  const visible = filter === "all" ? items : items.filter((i) => i.kind === filter);

  return (
    <Panel
      code="CN"
      title="News & Filings"
      icon={Newspaper}
      className={className}
      bodyClassName="flex flex-col"
      actions={
        <div role="group" aria-label="Filter feed" className="flex items-center gap-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded px-1.5 py-0.5 text-[10.5px] font-medium transition-colors",
                filter === f.key ? "bg-cyan-400/15 text-cyan-200" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      <SentimentSplit items={items} />
      <ul className="min-h-0 flex-1 divide-y divide-gray-800/60 overflow-y-auto">
        {visible.length === 0 && (
          <li className="px-3 py-6 text-center text-[11px] text-gray-400">
            {filter === "flow" ? "Waiting for tape alerts on this name…" : "Nothing in this filter yet."}
          </li>
        )}
        {visible.map((item) => {
          const Icon = KIND_ICON[item.kind];
          const fresh = item.kind === "flow" && now - item.ts < 90_000;
          return (
            <li key={item.id} className={cn("flex gap-3 px-3 py-2 hover:bg-white/[0.02]", fresh && "animate-rise-in bg-cyan-400/[0.04]")}>
              <time dateTime={new Date(item.ts).toISOString()} className="w-7 shrink-0 pt-px font-mono text-[10.5px] text-gray-400">
                {fmtAgo(now - item.ts)}
              </time>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5 text-[10px] tracking-wide text-gray-400 uppercase">
                  <Icon aria-hidden className="size-3 shrink-0" />
                  <span className="truncate">{item.source}</span>
                  {item.formType && (
                    <span className="shrink-0 rounded bg-cyan-400/10 px-1 font-mono tracking-normal text-cyan-300 normal-case">{item.formType}</span>
                  )}
                  {fresh && <span className="shrink-0 font-semibold text-cyan-300">New</span>}
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-gray-200">{item.headline}</p>
              </div>
              <div className="shrink-0 pt-px">
                <SentimentBadge sentiment={item.sentiment} />
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
