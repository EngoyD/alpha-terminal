import { COMPANY_LIST } from "@/lib/data/companies";
import { gaussian, hashString, mulberry32 } from "@/lib/random";
import type { ChartRange, QuoteSeed, SeriesPoint } from "@/lib/types";

/**
 * Last mock trading session. Synthetic history is anchored to a fixed date so it is
 * identical on every load; only the live tick layer changes.
 */
export const SESSION_DAY = Date.UTC(2026, 8, 25);
const SESSION_OPEN = Date.UTC(2026, 8, 25, 13, 30); // 09:30 ET (EDT)
const YEAR_START = Date.UTC(2026, 0, 1);
const BAR_MS = 5 * 60_000;
const INTRADAY_BARS = 78; // 09:30 → 16:00 in 5-minute bars
const DAY_MS = 86_400_000;

export interface TickerSeries {
  /** 252 sessions; the last point is today's session. */
  daily: SeriesPoint[];
  /** 79 points from the 09:30 open to the 16:00 close. */
  intraday: SeriesPoint[];
  open: number;
  dayHigh: number;
  dayLow: number;
  high52: number;
  low52: number;
}

export interface ChartPoint extends SeriesPoint {
  upVol: number;
  downVol: number;
}

function tradingDays(endDay: number, count: number): number[] {
  const days: number[] = [];
  for (let t = endDay; days.length < count; t -= DAY_MS) {
    const dow = new Date(t).getUTCDay();
    if (dow !== 0 && dow !== 6) days.push(t);
  }
  return days.reverse();
}

/** Log-space Brownian bridge with occasional jumps. Returns steps + 1 points with exact endpoints. */
function bridge(
  rand: () => number,
  steps: number,
  from: number,
  to: number,
  sigma: number,
  jumpProb: number,
): number[] {
  const walk = [0];
  for (let i = 1; i <= steps; i++) {
    let z = gaussian(rand);
    if (rand() < jumpProb) z += gaussian(rand) * 3.5;
    walk.push(walk[i - 1] + z);
  }
  const a = Math.log(from);
  const b = Math.log(to);
  const end = walk[steps];
  return walk.map((w, i) => {
    const f = i / steps;
    return Math.exp(a + f * (b - a) + (w - f * end) * sigma);
  });
}

function buildSeries(ticker: string, q: QuoteSeed): TickerSeries {
  const rand = mulberry32(hashString(ticker));
  const sigmaD = q.annualVol / Math.sqrt(252);

  const days = tradingDays(SESSION_DAY, 252);
  const closes = bridge(rand, days.length - 2, q.yearAgo, q.prevClose, sigmaD, 0.02);
  closes.push(q.last);
  const daily = days.map((t, i) => {
    const close = closes[i];
    const move = i === 0 ? 0 : Math.abs(Math.log(close / closes[i - 1])) / sigmaD;
    const volume =
      i === days.length - 1
        ? q.volume
        : q.avgVolume * Math.exp(0.3 * gaussian(rand)) * (1 + 0.6 * Math.max(0, move - 1));
    return { t, close, volume };
  });

  const open = q.prevClose * Math.exp(0.25 * sigmaD * gaussian(rand));
  const path = bridge(rand, INTRADAY_BARS, open, q.last, (sigmaD / Math.sqrt(INTRADAY_BARS)) * 1.1, 0.01);
  // U-shaped intraday volume profile: heavy at the open and into the close.
  const weights = path.map(
    (_, i) => (1 + 1.8 * Math.exp(-i / 6) + 1.1 * Math.exp(-(INTRADAY_BARS - i) / 7)) * Math.exp(0.25 * gaussian(rand)),
  );
  const weightSum = weights.reduce((s, w) => s + w, 0);
  const intraday = path.map((close, i) => ({
    t: SESSION_OPEN + i * BAR_MS,
    close,
    volume: (q.volume * weights[i]) / weightSum,
  }));

  return {
    daily,
    intraday,
    open,
    dayHigh: Math.max(...path),
    dayLow: Math.min(...path),
    high52: Math.max(...closes),
    low52: Math.min(...closes),
  };
}

export const SERIES: Record<string, TickerSeries> = Object.fromEntries(
  COMPANY_LIST.map((c) => [c.profile.ticker, buildSeries(c.profile.ticker, c.quote)]),
);

/** Downsampled intraday closes for watchlist sparklines (last point is replaced by the live price). */
export const SPARKS: Record<string, number[]> = Object.fromEntries(
  Object.entries(SERIES).map(([ticker, s]) => [ticker, s.intraday.filter((_, i) => i % 2 === 0).map((p) => p.close)]),
);

const RANGE_SESSIONS: Record<Exclude<ChartRange, "1D" | "YTD">, number> = {
  "1M": 22,
  "3M": 64,
  "6M": 127,
  "1Y": 252,
};

/** Slice the synthetic history for a range and splice the live price/volume into the last point. */
export function chartData(
  ticker: string,
  range: ChartRange,
  live: { price: number; prevClose: number; volume: number },
  seedVolume: number,
): ChartPoint[] {
  const s = SERIES[ticker];
  let base: SeriesPoint[];
  if (range === "1D") base = s.intraday;
  else if (range === "YTD") base = s.daily.filter((p) => p.t >= YEAR_START);
  else base = s.daily.slice(-RANGE_SESSIONS[range]);

  const last = base.length - 1;
  const extraVolume = Math.max(0, live.volume - seedVolume);
  return base.map((p, i) => {
    const close = i === last ? live.price : p.close;
    let volume = p.volume;
    if (i === last) volume = range === "1D" ? p.volume + extraVolume : live.volume;
    const prev = i === 0 ? (range === "1D" ? live.prevClose : close) : base[i - 1].close;
    const up = close >= prev;
    return { t: p.t, close, volume, upVol: up ? volume : 0, downVol: up ? 0 : volume };
  });
}
