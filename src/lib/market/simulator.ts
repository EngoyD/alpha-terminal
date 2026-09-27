import { COMPANY_LIST } from "@/lib/data/companies";
import { INDICES } from "@/lib/data/indices";
import { priceDecimals } from "@/lib/format";
import { clamp, gaussian } from "@/lib/random";
import type { LiveIndex, LiveQuote } from "@/lib/types";
import { SERIES } from "./series";

export const TICK_MS = 1600;

const SESSION_MS = 6.5 * 3600 * 1000;
const TICKS_PER_SESSION = SESSION_MS / TICK_MS;
const TICKS_PER_YEAR = 252 * TICKS_PER_SESSION;
/** Real per-tick moves are too small to watch; exaggerate them for the demo feed. */
const DEMO_AMPLIFY = 3;
/** Gentle pull back toward the seed price so a long-running tab doesn't drift off. */
const REVERSION = 0.01;

const INDEX_ANCHOR = Object.fromEntries(INDICES.map((i) => [i.symbol, i.value]));

export function initialQuotes(): Record<string, LiveQuote> {
  return Object.fromEntries(
    COMPANY_LIST.map(({ profile, quote }) => {
      const s = SERIES[profile.ticker];
      const live: LiveQuote = {
        price: quote.last,
        prevClose: quote.prevClose,
        open: s.open,
        high: s.dayHigh,
        low: s.dayLow,
        volume: quote.volume,
        dir: 0,
        seq: 0,
      };
      return [profile.ticker, live];
    }),
  );
}

export function initialIndices(): LiveIndex[] {
  return INDICES.map((i) => ({ ...i, dir: 0, seq: 0 }));
}

function rounded(n: number, decimals: number) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

/** One tick of the simulated feed. A shared market factor keeps stocks and indices moving together. */
export function stepMarket(
  quotes: Record<string, LiveQuote>,
  indices: LiveIndex[],
  rand: () => number = Math.random,
): { quotes: Record<string, LiveQuote>; indices: LiveIndex[] } {
  const market = gaussian(rand);
  const nextQuotes: Record<string, LiveQuote> = {};

  for (const { profile, quote: seed } of COMPANY_LIST) {
    const q = quotes[profile.ticker];
    if (rand() > 0.62) {
      nextQuotes[profile.ticker] = q;
      continue;
    }
    const sigma = (seed.annualVol / Math.sqrt(TICKS_PER_YEAR)) * DEMO_AMPLIFY;
    const rho = clamp(0.3 + 0.2 * seed.beta, 0, 0.85);
    const z = rho * market + Math.sqrt(1 - rho * rho) * gaussian(rand);
    const price = q.price * Math.exp(sigma * z - REVERSION * Math.log(q.price / seed.last));
    const d = priceDecimals(price);
    const changed = rounded(price, d) !== rounded(q.price, d);
    nextQuotes[profile.ticker] = {
      ...q,
      price,
      high: Math.max(q.high, price),
      low: Math.min(q.low, price),
      volume: q.volume + (seed.avgVolume / TICKS_PER_SESSION) * Math.exp(0.5 * gaussian(rand)),
      dir: changed ? (price > q.price ? 1 : -1) : q.dir,
      seq: changed ? q.seq + 1 : q.seq,
    };
  }

  const nextIndices = indices.map((ix) => {
    if (rand() > 0.7) return ix;
    const sigma = (ix.vol / Math.sqrt(TICKS_PER_YEAR)) * DEMO_AMPLIFY;
    const z = ix.corr * market + Math.sqrt(1 - ix.corr * ix.corr) * gaussian(rand);
    const value = ix.value * Math.exp(sigma * z - REVERSION * Math.log(ix.value / INDEX_ANCHOR[ix.symbol]));
    const changed = rounded(value, ix.decimals) !== rounded(ix.value, ix.decimals);
    return {
      ...ix,
      value,
      dir: changed ? (value > ix.value ? 1 : -1) : ix.dir,
      seq: changed ? ix.seq + 1 : ix.seq,
    } satisfies LiveIndex;
  });

  return { quotes: nextQuotes, indices: nextIndices };
}
