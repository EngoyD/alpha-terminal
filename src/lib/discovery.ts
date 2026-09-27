import { COMPANY_LIST } from "@/lib/data/companies";
import { clamp, mulberry32 } from "@/lib/random";
import type { Suggestion } from "@/lib/types";

/**
 * Ranks names outside the watchlist by catalyst / volatility / value signals.
 * Each rescan perturbs conviction slightly, the way a live screen would re-score.
 * Swap this for an LLM or quant screen later; the UI only needs `Suggestion[]`.
 */
export function rankDiscovery(watchlist: string[], scanSeed: number, count = 4): Suggestion[] {
  const rand = mulberry32(scanSeed * 7919 + 17);
  return COMPANY_LIST.filter((c) => !watchlist.includes(c.profile.ticker))
    .map((c) => ({
      ticker: c.profile.ticker,
      signal: c.discovery.signal,
      thesis: c.discovery.thesis,
      conviction: clamp(c.discovery.conviction + (rand() - 0.5) * 0.14, 0.05, 0.99),
    }))
    .sort((a, b) => b.conviction - a.conviction)
    .slice(0, count);
}
