"use client";

import { TriangleAlert } from "lucide-react";
import { useMarket, useTerminal } from "./TerminalProvider";
import { Kbd } from "./ui/primitives";

const SHORTCUTS: [string, string][] = [
  ["/", "search"],
  ["↑↓", "watchlist"],
  ["G", "AI report"],
  ["1–3", "sections"],
  ["W", "watch"],
];

export function StatusBar() {
  const { ticks, latencyMs } = useMarket();
  const { selected, reports, aiInfo } = useTerminal();
  const report = reports[selected]?.status ?? "idle";

  return (
    <footer className="flex h-7 shrink-0 items-center gap-4 overflow-hidden border-t border-gray-800/80 bg-gray-950 px-3 font-mono text-[10.5px] whitespace-nowrap text-gray-400">
      <span className="flex items-center gap-1.5 text-emerald-300">
        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
        SIM FEED
      </span>
      <span>
        LAT <span className="text-gray-200">{latencyMs}ms</span>
      </span>
      <span className="hidden sm:inline">
        TICKS <span className="text-gray-200">{ticks.toLocaleString("en-US")}</span>
      </span>
      <span className="hidden md:inline">
        SEL <span className="text-cyan-300">{selected}</span>
      </span>
      <span className="hidden md:inline">
        AI <span className="text-purple-300">{aiInfo ? `${aiInfo.provider}/${aiInfo.model}` : "…"}</span>{" "}
        <span className="text-gray-200 uppercase">{report}</span>
      </span>
      <div className="ml-auto hidden items-center gap-3 xl:flex">
        {SHORTCUTS.map(([key, label]) => (
          <span key={key} className="flex items-center gap-1">
            <Kbd>{key}</Kbd>
            {label}
          </span>
        ))}
      </div>
      <span className="ml-auto flex items-center gap-1 text-amber-300 xl:ml-0">
        <TriangleAlert aria-hidden className="size-3" />
        MOCK DATA<span className="hidden sm:inline"> · NOT INVESTMENT ADVICE</span>
      </span>
    </footer>
  );
}
