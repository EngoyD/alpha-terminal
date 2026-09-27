"use client";

import { AIDiscovery } from "./AIDiscovery";
import { TickerSearch } from "./TickerSearch";
import { Watchlist } from "./Watchlist";

/** Command center: search, watchlist and AI suggestions. `onNavigate` closes the mobile drawer. */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2 p-2">
      <TickerSearch onNavigate={onNavigate} />
      <Watchlist className="max-h-[48%] shrink-0" onNavigate={onNavigate} />
      <AIDiscovery className="min-h-40 flex-1" onNavigate={onNavigate} />
    </div>
  );
}
