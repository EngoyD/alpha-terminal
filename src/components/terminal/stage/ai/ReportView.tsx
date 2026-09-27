"use client";

import {
  Building2,
  ChartCandlestick,
  FileText,
  FlaskConical,
  Globe,
  Rocket,
  Scale,
  Shield,
  ShieldCheck,
  ShieldOff,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useEffectEvent, useState, type KeyboardEvent } from "react";
import type { AIReport, AIReportEnvelope, Catalyst, Level } from "@/lib/ai/schema";
import { useNow } from "@/hooks/useNow";
import { cn, fmtDay, fmtNyHm, isoDay } from "@/lib/format";
import { SentimentBadge, SeverityBadge } from "../../ui/primitives";
import { SECTIONS, type SectionKey } from "./sections";

const DAY_MS = 86_400_000;

const MOAT: Record<AIReport["business"]["moatRating"], { label: string; Icon: LucideIcon; className: string }> = {
  wide: { label: "Wide moat", Icon: ShieldCheck, className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  narrow: { label: "Narrow moat", Icon: Shield, className: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  none: { label: "No moat", Icon: ShieldOff, className: "border-red-500/30 bg-red-500/10 text-red-300" },
};

const CATALYST_ICON: Record<Catalyst["type"], LucideIcon> = {
  earnings: ChartCandlestick,
  clinical: FlaskConical,
  product: Rocket,
  regulatory: Scale,
  corporate: Building2,
  macro: Globe,
};

const LEVEL_RANK: Record<Level, number> = { high: 3, medium: 2, low: 1 };

function Typewriter({ text, animate, onDone }: { text: string; animate: boolean; onDone: () => void }) {
  const [count, setCount] = useState(animate ? 0 : text.length);
  const finish = useEffectEvent(onDone);

  useEffect(() => {
    if (!animate) return;
    let n = 0;
    const id = setInterval(() => {
      n = Math.min(text.length, n + 2);
      setCount(n);
      if (n >= text.length) {
        clearInterval(id);
        finish();
      }
    }, 14);
    return () => clearInterval(id);
  }, [animate, text]);

  const typing = count < text.length;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, count)}
        {typing && <span className="ml-px inline-block h-3 w-1.5 translate-y-0.5 animate-blink bg-purple-300" />}
      </span>
    </>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] tracking-wider text-gray-400 uppercase">Confidence</span>
      <div
        role="meter"
        aria-label="Model confidence"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-1.5 w-20 overflow-hidden rounded-full bg-purple-950/80"
      >
        <div className="h-full rounded-full bg-purple-400" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] text-purple-200 tabular-nums">{pct}%</span>
    </div>
  );
}

/** Three-bar strength indicator; the bar count carries the level, not the color. */
function ImpactMeter({ level }: { level: Level }) {
  const rank = LEVEL_RANK[level];
  return (
    <span className="inline-flex shrink-0 items-center gap-1" title={`${level} expected impact`}>
      <span className="sr-only">{level} impact</span>
      <span aria-hidden className="flex items-end gap-px">
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn("w-1 rounded-sm", i <= rank ? "bg-purple-300" : "bg-gray-700")} style={{ height: 4 + i * 3 }} />
        ))}
      </span>
      <span aria-hidden className="font-mono text-[9.5px] text-gray-400 uppercase">
        {level}
      </span>
    </span>
  );
}

function MoatSection({ business }: { business: AIReport["business"] }) {
  const moat = MOAT[business.moatRating];
  return (
    <div className="space-y-3.5">
      <p className="text-[12px] leading-relaxed text-gray-300">{business.overview}</p>

      <div>
        <div className="mb-1.5 text-[10px] tracking-wider text-gray-400 uppercase">Revenue mix (TTM)</div>
        {business.segments.length === 0 ? (
          <p className="rounded border border-dashed border-gray-700 px-2.5 py-2 text-[11px] text-gray-400">
            Pre-revenue. Value is driven by the clinical pipeline.
          </p>
        ) : (
          <ul className="space-y-1">
            {business.segments.map((seg) => (
              <li key={seg.name} className="grid grid-cols-[minmax(0,9rem)_1fr_2.75rem] items-center gap-2 text-[11px]">
                <span className="truncate text-gray-300">{seg.name}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                  <span className="block h-full rounded-full bg-purple-400/90" style={{ width: `${seg.share * 100}%` }} />
                </span>
                <span className="text-right font-mono text-gray-200 tabular-nums">{Math.round(seg.share * 100)}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-px text-[10px] font-semibold uppercase", moat.className)}>
          <moat.Icon aria-hidden className="size-3" />
          {moat.label}
        </span>
        <span className="text-[12px] font-medium text-gray-100">{business.moatHeadline}</span>
      </div>

      <ol className="space-y-2.5">
        {business.advantages.map((a, i) => (
          <li key={a.title} className="flex gap-2.5">
            <span className="mt-px font-mono text-[10px] text-purple-300">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div className="text-[12px] font-medium text-gray-100">{a.title}</div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-gray-400">{a.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function CatalystSection({ catalysts }: { catalysts: AIReport["catalysts"] }) {
  const now = useNow();
  // Undated or approximate entries (e.g. "Q4 2026" from a model) sort last.
  const sortKey = (date: string) => {
    const t = isoDay(date);
    return Number.isFinite(t) ? t : Number.MAX_SAFE_INTEGER;
  };
  const events = [...catalysts.events].sort((a, b) => sortKey(a.date) - sortKey(b.date));
  return (
    <div>
      <p className="mb-3 text-[12px] leading-relaxed text-gray-300">{catalysts.headline}</p>
      <ol className="space-y-2">
        {events.map((e) => {
          const day = isoDay(e.date);
          const valid = Number.isFinite(day);
          const days = valid ? Math.ceil((day - now) / DAY_MS) : NaN;
          const Icon = CATALYST_ICON[e.type];
          return (
            <li key={`${e.date}-${e.title}`} className="grid grid-cols-[3.75rem_1fr] gap-2.5">
              <div className="pt-2 text-right font-mono leading-tight">
                <div className="text-[11px] font-semibold text-gray-100 uppercase">
                  {e.dateLabel ?? (valid ? fmtDay(day) : e.date)}
                </div>
                <div className={cn("mt-0.5 text-[10px]", days >= 0 && days <= 14 ? "text-purple-300" : "text-gray-400")}>
                  {!valid ? "" : days > 0 ? `T−${days}d` : days === 0 ? "Today" : "Passed"}
                </div>
              </div>
              <div className="rounded-md border border-gray-800 bg-gray-950/40 px-2.5 py-2">
                <div className="flex items-start gap-1.5">
                  <Icon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-purple-300" />
                  <span className="min-w-0 flex-1 text-[12px] leading-snug font-medium text-gray-100">{e.title}</span>
                  <ImpactMeter level={e.impact} />
                </div>
                <div className="mt-0.5 pl-5 text-[10px] tracking-wider text-gray-400 uppercase">{e.type}</div>
                <p className="mt-1 pl-5 text-[11.5px] leading-relaxed text-gray-400">{e.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RiskSection({ risks }: { risks: AIReport["risks"] }) {
  const factors = [...risks.factors].sort((a, b) => LEVEL_RANK[b.severity] - LEVEL_RANK[a.severity]);
  return (
    <div>
      <p className="mb-3 text-[12px] leading-relaxed text-gray-300">{risks.headline}</p>
      <ul className="space-y-2">
        {factors.map((f) => (
          <li
            key={f.title}
            className={cn(
              "rounded-md border border-l-2 border-gray-800 bg-gray-950/40 px-2.5 py-2",
              f.severity === "high" ? "border-l-red-400" : f.severity === "medium" ? "border-l-amber-400" : "border-l-gray-500",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge level={f.severity} />
              <span className="text-[12px] font-medium text-gray-100">{f.title}</span>
            </div>
            <p className="mt-1 text-[11.5px] leading-relaxed text-gray-400">{f.summary}</p>
            <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-gray-800/70 px-1.5 py-px font-mono text-[10px] text-gray-300">
              <FileText aria-hidden className="size-3" />
              {f.source}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReportView({
  envelope,
  tab,
  onTab,
  animate,
  onTyped,
}: {
  envelope: AIReportEnvelope;
  tab: SectionKey;
  onTab: (tab: SectionKey) => void;
  animate: boolean;
  onTyped: () => void;
}) {
  const { report, meta } = envelope;
  const counts: Record<SectionKey, number> = {
    moat: report.business.advantages.length,
    catalysts: report.catalysts.events.length,
    risks: report.risks.factors.length,
  };
  const active = SECTIONS.find((s) => s.key === tab) ?? SECTIONS[0];
  const tabId = (key: SectionKey) => `ai-tab-${key}`;

  function onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = SECTIONS.findIndex((s) => s.key === tab);
    const next = SECTIONS[(i + (e.key === "ArrowRight" ? 1 : SECTIONS.length - 1)) % SECTIONS.length];
    onTab(next.key);
    document.getElementById(tabId(next.key))?.focus();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-gray-800/80 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <SentimentBadge sentiment={report.stance} size="md" />
          <ConfidenceMeter value={report.confidence} />
          <span className="ml-auto font-mono text-[10px] text-gray-400">
            {meta.cached && "cached · "}
            {fmtNyHm(Date.parse(meta.generatedAt))} ET · {(meta.latencyMs / 1000).toFixed(1)}s
          </span>
        </div>
        <p className="mt-2 text-[12.5px] leading-relaxed text-gray-100">
          <Typewriter text={report.summary} animate={animate} onDone={onTyped} />
        </p>
      </div>

      <div role="tablist" aria-label="Report sections" onKeyDown={onTabKeyDown} className="flex shrink-0 border-b border-gray-800/80 px-1.5">
        {SECTIONS.map((s, i) => {
          const selected = s.key === tab;
          return (
            <button
              key={s.key}
              id={tabId(s.key)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="ai-tabpanel"
              tabIndex={selected ? 0 : -1}
              onClick={() => onTab(s.key)}
              title={`${s.title} (${i + 1})`}
              className={cn(
                "relative flex items-center gap-1.5 px-2.5 py-2 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-purple-400",
                selected ? "text-purple-100" : "text-gray-400 hover:text-gray-200",
              )}
            >
              <span className="font-mono text-[9.5px] text-gray-400">{i + 1}</span>
              <s.Icon aria-hidden className="size-3.5" />
              {s.short}
              <span className="rounded bg-gray-800 px-1 font-mono text-[9.5px] text-gray-300">{counts[s.key]}</span>
              {selected && <span aria-hidden className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-purple-400" />}
            </button>
          );
        })}
      </div>

      <div
        id="ai-tabpanel"
        role="tabpanel"
        aria-labelledby={tabId(active.key)}
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-3 focus-visible:outline-none"
      >
        <div key={active.key} className="animate-rise-in">
          <h3 className="mb-2.5 text-[10px] font-semibold tracking-[0.14em] text-purple-300 uppercase">{active.title}</h3>
          {active.key === "moat" && <MoatSection business={report.business} />}
          {active.key === "catalysts" && <CatalystSection catalysts={report.catalysts} />}
          {active.key === "risks" && <RiskSection risks={report.risks} />}
        </div>
      </div>

      <footer className="shrink-0 border-t border-gray-800/80 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-400">
          <FileText aria-hidden className="size-3" />
          Sources
          {report.sources.map((src) => (
            <span key={src} className="rounded bg-gray-800/70 px-1.5 py-px font-mono text-gray-300">
              {src}
            </span>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-gray-400">
          {meta.model} · {meta.provider === "mock" ? "mock data" : "live model"} · verify against filings · not investment advice
        </p>
      </footer>
    </div>
  );
}
