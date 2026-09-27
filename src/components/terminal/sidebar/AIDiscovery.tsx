"use client";

import { Activity, CalendarClock, Gem, Plus, RefreshCw, Sparkles, type LucideIcon } from "lucide-react";
import { COMPANIES } from "@/lib/data/companies";
import { cn } from "@/lib/format";
import type { LiveQuote, SignalType, Suggestion } from "@/lib/types";
import { useMarket, useTerminal } from "../TerminalProvider";
import { Panel } from "../ui/Panel";
import { Change } from "../ui/primitives";

const SIGNAL: Record<SignalType, { label: string; Icon: LucideIcon }> = {
  catalyst: { label: "Catalyst", Icon: CalendarClock },
  volatility: { label: "Volatility", Icon: Activity },
  value: { label: "Value", Icon: Gem },
};

function SuggestionCard({
  suggestion,
  quote,
  active,
  onSelect,
  onAdd,
}: {
  suggestion: Suggestion;
  quote: LiveQuote;
  active: boolean;
  onSelect: () => void;
  onAdd: () => void;
}) {
  const { ticker, signal, thesis, conviction } = suggestion;
  const { label, Icon } = SIGNAL[signal];
  const score = Math.round(conviction * 100);
  return (
    <li
      className={cn(
        "group relative animate-rise-in rounded-md border bg-gray-950/40 transition-colors hover:border-purple-400/40",
        active ? "border-purple-400/50 bg-purple-500/[0.06]" : "border-gray-800",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="block w-full rounded-md px-2.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-purple-400"
      >
        <span className="flex items-center gap-2">
          <span className="font-mono text-[12.5px] font-bold text-gray-100">{ticker}</span>
          <Change pct={quote.price / quote.prevClose - 1} className="text-[10.5px]" iconClassName="size-2.5" />
          <span className="ml-auto inline-flex items-center gap-1 rounded border border-purple-500/30 bg-purple-500/10 px-1.5 py-px text-[9.5px] font-semibold tracking-wide text-purple-200 uppercase">
            <Icon aria-hidden className="size-3" />
            {label}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[10.5px] text-gray-400">{COMPANIES[ticker].profile.name}</span>
        <span className="mt-1.5 block text-[11.5px] leading-snug text-gray-300">
          <span className="mr-1 font-mono text-[9.5px] font-semibold tracking-wider text-purple-300 uppercase">AI thesis ›</span>
          {thesis}
        </span>
        <span className="mt-2 flex items-center gap-2 pr-16">
          <span className="text-[10px] text-gray-400">Conviction</span>
          <span
            role="meter"
            aria-label={`${ticker} conviction`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={score}
            className="h-1 flex-1 overflow-hidden rounded-full bg-purple-950/80"
          >
            <span className="block h-full rounded-full bg-purple-400 transition-[width] duration-500" style={{ width: `${score}%` }} />
          </span>
          <span className="font-mono text-[10.5px] text-purple-200 tabular-nums">{score}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Add ${ticker} to watchlist`}
        className="absolute right-2 bottom-1.5 inline-flex items-center gap-0.5 rounded border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-400/20 focus-visible:outline-2 focus-visible:outline-cyan-400"
      >
        <Plus aria-hidden className="size-3" />
        Watch
      </button>
    </li>
  );
}

export function AIDiscovery({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { suggestions, scanning, rescan, select, addTicker, selected } = useTerminal();
  const { quotes } = useMarket();

  return (
    <Panel
      code="AI"
      title="AI Discovery"
      icon={Sparkles}
      accent="purple"
      className={className}
      bodyClassName="overflow-y-auto"
      actions={
        <button
          type="button"
          onClick={rescan}
          disabled={scanning}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium text-purple-200 hover:bg-purple-500/15 disabled:opacity-60"
        >
          <RefreshCw aria-hidden className={cn("size-3", scanning && "animate-spin")} />
          {scanning ? "Scanning" : "Rescan"}
        </button>
      }
    >
      {scanning && (
        <div
          role="status"
          className="absolute inset-x-2 top-2 z-10 rounded border border-purple-500/30 bg-gray-950/95 px-2.5 py-2 font-mono text-[10.5px] leading-relaxed text-purple-200 shadow-lg shadow-black/50"
        >
          <span className="animate-blink">▍</span> Scanning 4,812 U.S. equities for catalysts, volatility and value…
          <div className="mt-1.5 h-0.5 overflow-hidden rounded bg-gray-800">
            <div className="h-full w-1/3 animate-sweep bg-purple-400" />
          </div>
        </div>
      )}
      {suggestions.length === 0 ? (
        <p className="px-4 py-6 text-center text-[11px] text-gray-400">Every covered name is already on your watchlist.</p>
      ) : (
        <ul className={cn("space-y-1.5 p-2 transition-opacity", scanning && "opacity-40")}>
          {suggestions.map((s) => (
            <SuggestionCard
              key={s.ticker}
              suggestion={s}
              quote={quotes[s.ticker]}
              active={selected === s.ticker}
              onSelect={() => {
                select(s.ticker);
                onNavigate?.();
              }}
              onAdd={() => addTicker(s.ticker)}
            />
          ))}
        </ul>
      )}
    </Panel>
  );
}
