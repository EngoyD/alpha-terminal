"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { requestAIReport } from "@/lib/ai/client";
import type { AIReportEnvelope } from "@/lib/ai/schema";
import { COMPANIES, DEFAULT_SELECTED, DEFAULT_WATCHLIST, isCovered } from "@/lib/data/companies";
import { rankDiscovery } from "@/lib/discovery";
import { initialIndices, initialQuotes, stepMarket, TICK_MS } from "@/lib/market/simulator";
import { makeWireItem } from "@/lib/market/wire";
import type { LiveIndex, LiveQuote, NewsItem, Suggestion } from "@/lib/types";

export type ReportState =
  | { status: "loading"; startedAt: number }
  | { status: "ready"; envelope: AIReportEnvelope }
  | { status: "error"; error: string };

export interface AIInfo {
  provider: string;
  model: string;
}

/** Minimum time the terminal-style loading sequence stays on screen. */
export const MIN_REPORT_MS = 3400;
/** Page-load time. Static headlines are placed relative to it. */
export const BOOT_TIME = Date.now();

const STORAGE_KEY = "alpha-terminal:v2";
const SCAN_MS = 1300;
const MAX_WIRE_ITEMS = 8;

interface TerminalState {
  watchlist: string[];
  selected: string;
  select: (ticker: string) => void;
  addTicker: (ticker: string) => void;
  removeTicker: (ticker: string) => void;
  toggleWatch: (ticker: string) => void;
  reports: Record<string, ReportState>;
  generateReport: (ticker: string) => void;
  aiInfo: AIInfo | null;
  suggestions: Suggestion[];
  scanning: boolean;
  rescan: () => void;
  wire: Record<string, NewsItem[]>;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface MarketState {
  quotes: Record<string, LiveQuote>;
  indices: LiveIndex[];
  ticks: number;
  latencyMs: number;
}

const TerminalContext = createContext<TerminalState | null>(null);
const MarketContext = createContext<MarketState | null>(null);

export function useTerminal(): TerminalState {
  const ctx = use(TerminalContext);
  if (!ctx) throw new Error("useTerminal must be used inside <TerminalProvider>");
  return ctx;
}

/** Live quotes and indices. Consumers re-render on every feed tick. */
export function useMarket(): MarketState {
  const ctx = use(MarketContext);
  if (!ctx) throw new Error("useMarket must be used inside <TerminalProvider>");
  return ctx;
}

function loadPrefs(): { watchlist: string[]; selected: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object") {
      const watchlist =
        "watchlist" in parsed && Array.isArray(parsed.watchlist)
          ? parsed.watchlist.filter((t): t is string => typeof t === "string" && isCovered(t))
          : DEFAULT_WATCHLIST;
      const selected =
        "selected" in parsed && typeof parsed.selected === "string" && isCovered(parsed.selected)
          ? parsed.selected
          : DEFAULT_SELECTED;
      return { watchlist, selected };
    }
  } catch {
    // Storage blocked or corrupt; fall back to defaults.
  }
  return { watchlist: DEFAULT_WATCHLIST, selected: DEFAULT_SELECTED };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [prefs] = useState(loadPrefs);
  const [watchlist, setWatchlist] = useState(prefs.watchlist);
  const [selected, setSelected] = useState(prefs.selected);
  const [reports, setReports] = useState<Record<string, ReportState>>({});
  const [aiInfo, setAiInfo] = useState<AIInfo | null>(null);
  const [scanSeed, setScanSeed] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [wire, setWire] = useState<Record<string, NewsItem[]>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [market, setMarket] = useState<MarketState>(() => ({
    quotes: initialQuotes(),
    indices: initialIndices(),
    ticks: 0,
    latencyMs: 12,
  }));
  const inflight = useRef(new Set<string>());
  const scanTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Simulated market feed.
  const onMarketTick = useEffectEvent(() => {
    const next = stepMarket(market.quotes, market.indices);
    setMarket({ ...next, ticks: market.ticks + 1, latencyMs: Math.round(7 + Math.random() * 16) });
  });
  useEffect(() => {
    const id = setInterval(() => onMarketTick(), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Synthetic tape alerts, weighted toward the ticker on screen.
  const onWireTick = useEffectEvent(() => {
    const pool = watchlist.length ? watchlist : [selected];
    const ticker = Math.random() < 0.6 ? selected : pool[Math.floor(Math.random() * pool.length)];
    const item = makeWireItem(ticker, market.quotes[ticker], COMPANIES[ticker].quote.avgVolume, Math.random, Date.now());
    setWire((w) => ({ ...w, [ticker]: [item, ...(w[ticker] ?? [])].slice(0, MAX_WIRE_ITEMS) }));
  });
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const schedule = (delay: number) => {
      id = setTimeout(() => {
        onWireTick();
        schedule(22_000 + Math.random() * 16_000);
      }, delay);
    };
    schedule(6_000);
    return () => clearTimeout(id);
  }, []);

  // Which provider/model the report route is configured for.
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ai-report", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((info: unknown) => {
        if (info && typeof info === "object" && "provider" in info && "model" in info) {
          setAiInfo({ provider: String(info.provider), model: String(info.model) });
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ watchlist, selected }));
    } catch {
      // Persistence is a convenience only.
    }
  }, [watchlist, selected]);

  useEffect(() => () => clearTimeout(scanTimer.current), []);

  const select = useCallback((ticker: string) => {
    if (isCovered(ticker)) setSelected(ticker);
  }, []);

  const addTicker = useCallback((ticker: string) => {
    if (!isCovered(ticker)) return;
    setWatchlist((wl) => (wl.includes(ticker) ? wl : [...wl, ticker]));
  }, []);

  const removeTicker = useCallback((ticker: string) => {
    setWatchlist((wl) => wl.filter((t) => t !== ticker));
  }, []);

  const toggleWatch = useCallback((ticker: string) => {
    if (!isCovered(ticker)) return;
    setWatchlist((wl) => (wl.includes(ticker) ? wl.filter((t) => t !== ticker) : [...wl, ticker]));
  }, []);

  const generateReport = useCallback((ticker: string) => {
    if (!isCovered(ticker) || inflight.current.has(ticker)) return;
    inflight.current.add(ticker);
    const startedAt = Date.now();
    setReports((r) => ({ ...r, [ticker]: { status: "loading", startedAt } }));
    // Hold the loading sequence for a minimum time so fast responses still read as a pipeline.
    Promise.allSettled([requestAIReport(ticker), wait(MIN_REPORT_MS)]).then(([result]) => {
      inflight.current.delete(ticker);
      const next: ReportState =
        result.status === "fulfilled"
          ? { status: "ready", envelope: result.value }
          : {
              status: "error",
              error: result.reason instanceof Error ? result.reason.message : "Report generation failed.",
            };
      setReports((r) => ({ ...r, [ticker]: next }));
    });
  }, []);

  const rescan = useCallback(() => {
    if (scanTimer.current) return;
    setScanning(true);
    scanTimer.current = setTimeout(() => {
      scanTimer.current = undefined;
      setScanSeed((s) => s + 1);
      setScanning(false);
    }, SCAN_MS);
  }, []);

  const suggestions = useMemo(() => rankDiscovery(watchlist, scanSeed), [watchlist, scanSeed]);

  const terminal = useMemo<TerminalState>(
    () => ({
      watchlist,
      selected,
      select,
      addTicker,
      removeTicker,
      toggleWatch,
      reports,
      generateReport,
      aiInfo,
      suggestions,
      scanning,
      rescan,
      wire,
      sidebarOpen,
      setSidebarOpen,
    }),
    [
      watchlist,
      selected,
      select,
      addTicker,
      removeTicker,
      toggleWatch,
      reports,
      generateReport,
      aiInfo,
      suggestions,
      scanning,
      rescan,
      wire,
      sidebarOpen,
    ],
  );

  return (
    <TerminalContext value={terminal}>
      <MarketContext value={market}>{children}</MarketContext>
    </TerminalContext>
  );
}
