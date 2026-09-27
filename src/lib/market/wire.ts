import { fmtCompact, fmtPct, fmtPrice } from "@/lib/format";
import type { LiveQuote, NewsItem, Sentiment } from "@/lib/types";

const EXPIRIES = ["Oct 16", "Nov 20", "Dec 18", "Jan 15 '27"];
const SOURCES = ["Flow Desk", "Tape Alert"];

function pick<T>(items: T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)];
}

function strikeStep(price: number) {
  if (price >= 200) return 10;
  if (price >= 50) return 5;
  if (price >= 10) return 1;
  return 0.5;
}

/** Generates a synthetic tape/flow alert from the live quote. Never presented as real news. */
export function makeWireItem(
  ticker: string,
  q: LiveQuote,
  avgVolume: number,
  rand: () => number,
  now: number,
): NewsItem {
  const step = strikeStep(q.price);
  const strike = (mult: number) => {
    const k = Math.max(step, Math.round((q.price * mult) / step) * step);
    return Number.isInteger(k) ? String(k) : k.toFixed(1);
  };
  const dayMove = q.price / q.prevClose - 1;
  const up = q.dir >= 0;

  const templates: (() => { sentiment: Sentiment; headline: string })[] = [
    () => ({
      sentiment: "bullish",
      headline: `Call sweep: ${ticker} ${pick(EXPIRIES, rand)} ${strike(1.04 + rand() * 0.1)}C, ${(2 + rand() * 6).toFixed(1)}× average size`,
    }),
    () => ({
      sentiment: "bearish",
      headline: `Put sweep: ${ticker} ${pick(EXPIRIES, rand)} ${strike(0.96 - rand() * 0.1)}P, $${(0.4 + rand() * 4).toFixed(1)}M premium`,
    }),
    () => ({
      sentiment: "neutral",
      headline: `Block trade: ${fmtCompact(avgVolume * (0.002 + rand() * 0.004), 1)} ${ticker} shares @ ${fmtPrice(q.price)}`,
    }),
    () => ({
      sentiment: up ? "bullish" : "bearish",
      headline: `${ticker} ${up ? "reclaims" : "slips below"} intraday VWAP near ${fmtPrice(q.price * (up ? 0.998 : 1.002))}`,
    }),
    () => ({
      sentiment: dayMove >= 0 ? "bullish" : "bearish",
      headline: `${ticker} ${dayMove >= 0 ? "extends gains" : "extends losses"} to ${fmtPct(dayMove)} on the session`,
    }),
    () => ({
      sentiment: "neutral",
      headline: `${ticker} options volume at ${(1.3 + rand() * 1.5).toFixed(1)}× normal; put/call ratio ${(0.5 + rand() * 0.8).toFixed(2)}`,
    }),
  ];

  const { sentiment, headline } = pick(templates, rand)();
  return {
    id: `wire-${ticker}-${now}-${Math.floor(rand() * 1e6)}`,
    kind: "flow",
    source: pick(SOURCES, rand),
    headline,
    sentiment,
    ts: now,
  };
}
