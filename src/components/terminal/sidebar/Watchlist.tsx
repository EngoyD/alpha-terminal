"use client";

import { Star, Trash2 } from "lucide-react";
import { COMPANIES } from "@/lib/data/companies";
import { cn } from "@/lib/format";
import { SPARKS } from "@/lib/market/series";
import type { LiveQuote } from "@/lib/types";
import { useMarket, useTerminal } from "../TerminalProvider";
import { Panel } from "../ui/Panel";
import { Change, FlashPrice, Sparkline } from "../ui/primitives";

function WatchRow({
  ticker,
  quote,
  active,
  onSelect,
  onRemove,
}: {
  ticker: string;
  quote: LiveQuote;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const spark = SPARKS[ticker];
  const values = [...spark.slice(0, -1), quote.price];
  return (
    <li className={cn("group relative flex items-center", active && "bg-cyan-400/[0.06]")}>
      {active && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-cyan-400" />}
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_4rem_auto] items-center gap-2.5 py-2 pr-1 pl-3 text-left hover:bg-white/[0.02] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-400"
      >
        <span className="min-w-0">
          <span className={cn("block font-mono text-[12.5px] font-bold", active ? "text-cyan-200" : "text-gray-100")}>{ticker}</span>
          <span className="block truncate text-[10.5px] text-gray-400">{COMPANIES[ticker].profile.name}</span>
        </span>
        <Sparkline values={values} reference={quote.prevClose} className="h-5 w-16" />
        <span className="flex flex-col items-end">
          <FlashPrice price={quote.price} dir={quote.dir} seq={quote.seq} className="px-0.5 text-[12px] text-gray-100" />
          <Change pct={quote.price / quote.prevClose - 1} className="text-[10.5px]" iconClassName="size-2.5" />
        </span>
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${ticker} from watchlist`}
        title="Remove"
        className="mr-1.5 grid size-6 shrink-0 place-items-center rounded text-gray-500 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-300 focus-visible:opacity-100 pointer-coarse:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  );
}

export function Watchlist({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { watchlist, selected, select, removeTicker } = useTerminal();
  const { quotes } = useMarket();

  return (
    <Panel
      code="WL"
      title="My Watchlist"
      icon={Star}
      className={className}
      bodyClassName="overflow-y-auto"
      actions={<span className="px-1 font-mono text-[10px] text-gray-400">{watchlist.length} names</span>}
    >
      {watchlist.length === 0 ? (
        <p className="px-4 py-6 text-center text-[11px] leading-relaxed text-gray-400">
          Watchlist empty. Search above or add a name from AI Discovery.
        </p>
      ) : (
        <ul data-watchlist className="divide-y divide-gray-800/60">
          {watchlist.map((ticker) => (
            <WatchRow
              key={ticker}
              ticker={ticker}
              quote={quotes[ticker]}
              active={ticker === selected}
              onSelect={() => {
                select(ticker);
                onNavigate?.();
              }}
              onRemove={() => removeTicker(ticker)}
            />
          ))}
        </ul>
      )}
    </Panel>
  );
}
