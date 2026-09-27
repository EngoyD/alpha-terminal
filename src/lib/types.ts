export type Sentiment = "bullish" | "bearish" | "neutral";
export type Tone = "good" | "warning" | "critical" | "neutral";
export type SignalType = "catalyst" | "volatility" | "value";
export type CompanyKind = "mega-cap" | "large-cap" | "growth" | "clinical-biotech";

export interface CompanyProfile {
  ticker: string;
  name: string;
  exchange: "NASDAQ" | "NYSE";
  sector: string;
  industry: string;
  kind: CompanyKind;
  description: string;
  hq: string;
  employees: number;
  ceo: string;
  founded: number;
}

/** Static quote inputs. Live values are simulated on top of these. */
export interface QuoteSeed {
  last: number;
  prevClose: number;
  /** Close ~252 sessions ago; anchors the synthetic 1Y series. */
  yearAgo: number;
  volume: number;
  avgVolume: number;
  sharesOutstanding: number;
  epsTTM: number;
  beta: number;
  /** Annualized volatility used by the series generator and the tick simulator. */
  annualVol: number;
}

export interface SecFlag {
  label: string;
  tone: Tone;
}

export interface Fundamentals {
  /** Latest periodic filing, e.g. "Q2 FY27". */
  period: string;
  form: "10-Q" | "10-K";
  filedAt: string;
  /** Latest annual report, e.g. "10-K FY2026". */
  annualReport: string;
  /** Cash, equivalents and marketable securities (USD). */
  cash: number;
  totalDebt: number;
  /** Operating cash flow for the latest quarter; negative means cash burn. */
  quarterlyOpCashFlow: number;
  revenueTTM: number;
  netIncomeTTM: number;
  grossMargin: number | null;
  /** Fraction of float. */
  shortInterest: number;
  institutionalOwnership: number;
  flags: SecFlag[];
}

export interface NewsSeed {
  kind: "news" | "filing";
  source: string;
  headline: string;
  sentiment: Sentiment;
  formType?: string;
  minutesAgo: number;
}

export interface NewsItem {
  id: string;
  kind: "news" | "filing" | "flow";
  source: string;
  headline: string;
  sentiment: Sentiment;
  formType?: string;
  /** Epoch ms. */
  ts: number;
}

export interface DiscoverySeed {
  signal: SignalType;
  thesis: string;
  /** Baseline conviction, 0–1. */
  conviction: number;
}

export interface Company {
  profile: CompanyProfile;
  quote: QuoteSeed;
  fundamentals: Fundamentals;
  discovery: DiscoverySeed;
  news: NewsSeed[];
}

export interface LiveQuote {
  price: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  /** Direction of the last visible price change. */
  dir: 1 | -1 | 0;
  /** Increments on every visible price change; used to re-trigger flash animations. */
  seq: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  prevClose: number;
  decimals: number;
  kind: "index" | "yield" | "fx" | "crypto" | "commodity";
  /** Correlation with the common market factor (VIX is negative). */
  corr: number;
  /** Annualized volatility. */
  vol: number;
}

export interface LiveIndex extends MarketIndex {
  dir: 1 | -1 | 0;
  seq: number;
}

export interface SeriesPoint {
  t: number;
  close: number;
  volume: number;
}

export type ChartRange = "1D" | "1M" | "3M" | "6M" | "YTD" | "1Y";

export interface Suggestion {
  ticker: string;
  signal: SignalType;
  thesis: string;
  conviction: number;
}
