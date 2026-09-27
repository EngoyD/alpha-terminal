"use client";

import { Sparkles, Star } from "lucide-react";
import type { ReactNode } from "react";
import { SERIES } from "@/lib/market/series";
import { cn, fmtCompact, fmtNum, fmtPrice, fmtUsdCompact } from "@/lib/format";
import type { Company } from "@/lib/types";
import { useMarket, useTerminal } from "../TerminalProvider";
import { Change, FlashPrice, Kbd, RangeBar } from "../ui/primitives";

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">{label}</dt>
      <dd className="mt-0.5 font-mono text-[13px] text-gray-100 tabular-nums">{children}</dd>
    </div>
  );
}

export function TickerHero({ company, className }: { company: Company; className?: string }) {
  const { profile, quote: seed } = company;
  const q = useMarket().quotes[profile.ticker];
  const { watchlist, toggleWatch, generateReport, reports } = useTerminal();
  const s = SERIES[profile.ticker];

  const change = q.price - q.prevClose;
  const pct = change / q.prevClose;
  const watched = watchlist.includes(profile.ticker);
  const pe = seed.epsTTM > 0 ? fmtNum(q.price / seed.epsTTM, 1) : "NM";
  const reportState = reports[profile.ticker]?.status;

  return (
    <section
      aria-label={`${profile.ticker} quote`}
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-3 rounded-md border border-gray-800 bg-gray-900/55 px-4 py-3 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]",
        className,
      )}
    >
      <div key={profile.ticker} className="order-1 min-w-0 animate-fade-in">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-2xl leading-none font-bold tracking-tight text-white">{profile.ticker}</h1>
          <span className="rounded border border-gray-700 px-1 py-px font-mono text-[10px] text-gray-400">{profile.exchange}</span>
          <button
            type="button"
            onClick={() => toggleWatch(profile.ticker)}
            aria-pressed={watched}
            aria-label={watched ? `Remove ${profile.ticker} from watchlist` : `Add ${profile.ticker} to watchlist`}
            title={watched ? "On watchlist (W)" : "Add to watchlist (W)"}
            className="grid size-6 place-items-center rounded text-gray-400 hover:bg-gray-800 hover:text-amber-300"
          >
            <Star className={cn("size-4", watched && "fill-amber-300 text-amber-300")} />
          </button>
        </div>
        <p className="mt-1 max-w-72 truncate text-xs text-gray-400">
          {profile.name} · {profile.industry}
        </p>
      </div>

      <div className="order-2 min-w-0">
        <div className="flex items-baseline gap-3">
          <FlashPrice price={q.price} dir={q.dir} seq={q.seq} className="px-1 text-3xl leading-none font-semibold text-white" />
          <Change value={change} pct={pct} className="text-sm" iconClassName="size-4" />
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 px-1 text-[10px] tracking-wider text-gray-400 uppercase">
          <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live · USD · Simulated feed
        </div>
      </div>

      {/* Own row below 2xl; joins the headline row on wide screens. */}
      <dl className="order-4 flex min-w-0 basis-full flex-wrap gap-x-7 gap-y-2 border-t border-gray-800/70 pt-2.5 2xl:order-3 2xl:basis-0 2xl:flex-1 2xl:border-0 2xl:pt-0">
        <Stat label="Mkt cap">{fmtUsdCompact(q.price * seed.sharesOutstanding)}</Stat>
        <Stat label="Volume">
          {fmtCompact(q.volume, 1)}
          <span className="ml-1.5 text-[11px] text-gray-400">{fmtNum(q.volume / seed.avgVolume, 2)}× avg</span>
        </Stat>
        <Stat label="P/E (TTM)">
          {pe}
          <span className="ml-1.5 text-[11px] text-gray-400">β {fmtNum(seed.beta, 2)}</span>
        </Stat>
        <Stat label="Day range">
          <RangeBar label="Day range" low={q.low} high={q.high} value={q.price} />
        </Stat>
        <Stat label="52-wk range">
          <RangeBar label="52-week range" low={Math.min(s.low52, q.low)} high={Math.max(s.high52, q.high)} value={q.price} />
        </Stat>
        <Stat label="Open · prev close">
          {fmtPrice(q.open)} <span className="text-gray-400">·</span> {fmtPrice(q.prevClose)}
        </Stat>
      </dl>

      <button
        type="button"
        onClick={() => generateReport(profile.ticker)}
        disabled={reportState === "loading"}
        className="order-3 ml-auto inline-flex shrink-0 items-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/15 px-3 py-1.5 text-xs font-medium text-purple-100 shadow-[0_0_24px_-8px] shadow-purple-500/60 transition hover:bg-purple-500/25 focus-visible:outline-2 focus-visible:outline-purple-400 disabled:cursor-progress disabled:opacity-70 2xl:order-4"
      >
        <Sparkles aria-hidden className={cn("size-3.5", reportState === "loading" && "animate-pulse")} />
        {reportState === "loading" ? "Generating…" : reportState === "ready" ? "Regenerate" : "AI Report"}
        <Kbd className="border-purple-400/30 bg-purple-500/10 text-purple-200">G</Kbd>
      </button>
    </section>
  );
}
