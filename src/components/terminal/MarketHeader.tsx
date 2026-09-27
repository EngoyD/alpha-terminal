"use client";

import { Menu, SquareTerminal } from "lucide-react";
import { useNow } from "@/hooks/useNow";
import { cn, fmtClock, fmtNum, fmtNyDate, fmtPct, fmtSigned } from "@/lib/format";
import { exchangeStatuses, type ExchangeStatus, type SessionPhase } from "@/lib/market/session";
import type { LiveIndex } from "@/lib/types";
import { useMarket, useTerminal } from "./TerminalProvider";
import { upDownClass } from "./ui/primitives";

const PHASE: Record<SessionPhase, { label: string; dot: string; text: string }> = {
  open: { label: "Open", dot: "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/70", text: "text-emerald-300" },
  pre: { label: "Pre-mkt", dot: "bg-amber-400", text: "text-amber-300" },
  post: { label: "After-hrs", dot: "bg-amber-400", text: "text-amber-300" },
  lunch: { label: "Lunch", dot: "bg-amber-400", text: "text-amber-300" },
  closed: { label: "Closed", dot: "bg-gray-500", text: "text-gray-400" },
};

const CITY_CODE: Record<ExchangeStatus["id"], string> = { NYSE: "NY", LSE: "LDN", TSE: "TYO" };

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid size-7 place-items-center rounded-md bg-cyan-400/10 ring-1 ring-cyan-400/40">
        <SquareTerminal aria-hidden className="size-4 text-cyan-300" />
      </div>
      <div className="leading-none">
        <div className="font-mono text-[13px] font-bold tracking-tight text-white">
          ALPHA<span className="text-cyan-300">/</span>TERMINAL
        </div>
        <div className="mt-0.5 font-mono text-[9px] tracking-[0.22em] text-gray-400">V2 · RESEARCH</div>
      </div>
    </div>
  );
}

function IndexTile({ index }: { index: LiveIndex }) {
  const change = index.value - index.prevClose;
  const yieldBp = index.kind === "yield";
  return (
    <li className="flex shrink-0 items-baseline gap-2 px-3" title={index.name}>
      <span className="text-[10px] font-semibold tracking-wider text-gray-400">{index.symbol}</span>
      <span
        key={index.seq}
        className={cn(
          "rounded-sm font-mono text-xs text-gray-100 tabular-nums",
          index.seq > 0 && (index.dir > 0 ? "animate-flash-up" : "animate-flash-down"),
        )}
      >
        {fmtNum(index.value, index.decimals)}
        {yieldBp && "%"}
      </span>
      <span className={cn("font-mono text-[11px] tabular-nums", upDownClass(change))}>
        {yieldBp ? `${fmtSigned(change * 100, 1)}bp` : fmtPct(change / index.prevClose)}
      </span>
    </li>
  );
}

function ExchangePills({ now }: { now: number }) {
  const [nyse, ...others] = exchangeStatuses(now);
  const ny = PHASE[nyse.phase];
  return (
    <div className="flex items-center gap-4">
      <div className="leading-tight">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          <span aria-hidden className={cn("size-1.5 rounded-full", ny.dot)} />
          <span className="text-gray-300">NYSE</span>
          <span className={cn("uppercase", ny.text)}>{ny.label}</span>
        </div>
        <div className="font-mono text-[10px] text-gray-400">{nyse.detail}</div>
      </div>
      <div className="hidden flex-col gap-0.5 2xl:flex">
        {others.map((ex) => {
          const p = PHASE[ex.phase];
          return (
            <div key={ex.id} className="flex items-center gap-1.5 font-mono text-[10px] leading-none" title={`${ex.city}: ${ex.detail}`}>
              <span aria-hidden className={cn("size-1.5 rounded-full", p.dot)} />
              <span className="w-7 text-gray-400">{CITY_CODE[ex.id]}</span>
              <span className="text-gray-300">{fmtClock(now, ex.timeZone)}</span>
              <span className={cn("uppercase", p.text)}>{p.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarketHeader() {
  const { indices } = useMarket();
  const { setSidebarOpen } = useTerminal();
  const now = useNow();

  return (
    <header className="relative z-10 flex h-11 shrink-0 items-center border-b border-gray-800/80 bg-gray-950/85 backdrop-blur">
      <div className="flex h-full shrink-0 items-center gap-2 px-3 lg:w-72 lg:border-r lg:border-gray-800/80 xl:w-80">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open watchlist"
          className="-ml-1 grid size-8 place-items-center rounded text-gray-300 hover:bg-gray-800 lg:hidden"
        >
          <Menu className="size-4" />
        </button>
        <Logo />
      </div>

      <div className="relative hidden h-full min-w-0 flex-1 items-center overflow-hidden sm:flex">
        <ul aria-label="Market overview" className="flex items-center divide-x divide-gray-800/80">
          {indices.map((ix) => (
            <IndexTile key={ix.symbol} index={ix} />
          ))}
        </ul>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-gray-950 to-transparent" />
      </div>

      <div className="ml-auto flex h-full shrink-0 items-center gap-4 border-l border-gray-800/80 px-3 sm:ml-0">
        <ExchangePills now={now} />
        <div className="hidden text-right leading-tight md:block">
          <div className="font-mono text-[15px] font-semibold text-white tabular-nums">
            {fmtClock(now)}
            <span className="ml-1 text-[10px] font-medium text-gray-400">ET</span>
          </div>
          <div className="font-mono text-[10px] tracking-wide text-gray-400">{fmtNyDate(now)}</div>
        </div>
      </div>
    </header>
  );
}
