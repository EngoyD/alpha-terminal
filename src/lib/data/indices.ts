import type { MarketIndex } from "@/lib/types";

/** Mock index levels. `corr` ties each series to a shared market factor so the board moves together. */
export const INDICES: MarketIndex[] = [
  { symbol: "SPX", name: "S&P 500", value: 6948.21, prevClose: 6919.37, decimals: 2, kind: "index", corr: 1, vol: 0.16 },
  { symbol: "COMP", name: "Nasdaq", value: 23841.55, prevClose: 23702.1, decimals: 2, kind: "index", corr: 0.95, vol: 0.21 },
  { symbol: "DJI", name: "Dow", value: 47215.8, prevClose: 47150.44, decimals: 2, kind: "index", corr: 0.9, vol: 0.14 },
  { symbol: "VIX", name: "Volatility", value: 15.82, prevClose: 16.41, decimals: 2, kind: "index", corr: -0.8, vol: 0.9 },
  { symbol: "US10Y", name: "10Y yield", value: 4.126, prevClose: 4.139, decimals: 3, kind: "yield", corr: 0.2, vol: 0.12 },
  { symbol: "RUT", name: "Russell 2K", value: 2512.34, prevClose: 2520.9, decimals: 2, kind: "index", corr: 0.85, vol: 0.22 },
  { symbol: "BTC", name: "Bitcoin", value: 118420, prevClose: 116980, decimals: 0, kind: "crypto", corr: 0.3, vol: 0.55 },
  { symbol: "DXY", name: "Dollar", value: 97.84, prevClose: 97.95, decimals: 2, kind: "fx", corr: -0.2, vol: 0.07 },
  { symbol: "WTI", name: "Crude", value: 68.42, prevClose: 68.9, decimals: 2, kind: "commodity", corr: 0.2, vol: 0.32 },
  { symbol: "GOLD", name: "Gold", value: 3954.1, prevClose: 3938.6, decimals: 1, kind: "commodity", corr: -0.1, vol: 0.15 },
];
