import {
  ArrowDownRight,
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  Info,
  Minus,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { clamp } from "@/lib/random";
import { cn, fmtPct, fmtPrice, fmtSigned } from "@/lib/format";
import type { Sentiment, Tone } from "@/lib/types";

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-4 items-center justify-center rounded border border-gray-700 bg-gray-800/80 px-1 font-mono text-[10px] leading-4 font-medium text-gray-300",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function upDownClass(value: number): string {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-red-400";
  return "text-gray-400";
}

/** Signed change with arrow, so direction never relies on color alone. */
export function Change({
  value,
  pct,
  className,
  iconClassName = "size-3",
}: {
  value?: number;
  pct: number;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-mono tabular-nums", upDownClass(pct), className)}>
      <Icon aria-hidden className={cn("shrink-0", iconClassName)} />
      {value !== undefined && <span>{fmtSigned(value)}</span>}
      <span>{value !== undefined ? `(${fmtPct(pct)})` : fmtPct(pct)}</span>
    </span>
  );
}

/** Price that briefly flashes green/red when it ticks. Re-keyed on each visible change. */
export function FlashPrice({
  price,
  dir,
  seq,
  className,
}: {
  price: number;
  dir: number;
  seq: number;
  className?: string;
}) {
  return (
    <span
      key={seq}
      className={cn(
        "rounded-sm font-mono tabular-nums",
        seq > 0 && (dir > 0 ? "animate-flash-up" : dir < 0 ? "animate-flash-down" : ""),
        className,
      )}
    >
      {fmtPrice(price)}
    </span>
  );
}

const SENTIMENT: Record<Sentiment, { label: string; Icon: LucideIcon; className: string }> = {
  bullish: { label: "Bullish", Icon: TrendingUp, className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  bearish: { label: "Bearish", Icon: TrendingDown, className: "border-red-500/30 bg-red-500/10 text-red-300" },
  neutral: { label: "Neutral", Icon: Minus, className: "border-gray-600/60 bg-gray-500/10 text-gray-300" },
};

export function SentimentBadge({ sentiment, size = "sm" }: { sentiment: Sentiment; size?: "sm" | "md" }) {
  const { label, Icon, className } = SENTIMENT[sentiment];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded border font-semibold tracking-wide uppercase",
        size === "md" ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-px text-[10px]",
        className,
      )}
    >
      <Icon aria-hidden className={size === "md" ? "size-3.5" : "size-3"} />
      {label}
    </span>
  );
}

export const TONE: Record<Tone, { Icon: LucideIcon; text: string; chip: string; bar: string }> = {
  good: { Icon: CircleCheck, text: "text-emerald-300", chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200", bar: "bg-emerald-400" },
  warning: { Icon: TriangleAlert, text: "text-amber-300", chip: "border-amber-500/25 bg-amber-500/10 text-amber-200", bar: "bg-amber-400" },
  critical: { Icon: CircleAlert, text: "text-red-300", chip: "border-red-500/30 bg-red-500/10 text-red-200", bar: "bg-red-400" },
  neutral: { Icon: Info, text: "text-gray-300", chip: "border-gray-700 bg-gray-800/50 text-gray-300", bar: "bg-gray-400" },
};

export function ToneChip({ tone, children }: { tone: Tone; children: ReactNode }) {
  const { Icon, chip } = TONE[tone];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10.5px] leading-tight", chip)}>
      <Icon aria-hidden className="size-3 shrink-0" />
      {children}
    </span>
  );
}

const SEVERITY = {
  high: { label: "High", Icon: ShieldAlert, className: "border-red-500/30 bg-red-500/10 text-red-300" },
  medium: { label: "Medium", Icon: TriangleAlert, className: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  low: { label: "Low", Icon: Info, className: "border-gray-600/60 bg-gray-500/10 text-gray-300" },
} as const;

export function SeverityBadge({ level }: { level: keyof typeof SEVERITY }) {
  const { label, Icon, className } = SEVERITY[level];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-px text-[10px] font-semibold uppercase", className)}>
      <Icon aria-hidden className="size-3" />
      {label}
    </span>
  );
}

/** Low–high track with a marker for the current value (day range, 52-week range). */
export function RangeBar({ label, low, high, value }: { label: string; low: number; high: number; value: number }) {
  const pos = high > low ? clamp((value - low) / (high - low), 0, 1) : 0.5;
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] text-gray-400 tabular-nums">
      <span>{fmtPrice(low)}</span>
      <div
        role="img"
        aria-label={`${label}: ${fmtPrice(value)}, range ${fmtPrice(low)} to ${fmtPrice(high)}`}
        className="relative h-1 w-14 rounded-full bg-gray-700/70 xl:w-16"
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-gray-500/70" style={{ width: `${pos * 100}%` }} />
        <div
          className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 ring-2 ring-gray-900"
          style={{ left: `${pos * 100}%` }}
        />
      </div>
      <span>{fmtPrice(high)}</span>
    </div>
  );
}

/** Tiny intraday line with a dotted previous-close reference. */
export function Sparkline({
  values,
  reference,
  className,
}: {
  values: number[];
  reference: number;
  className?: string;
}) {
  const w = 64;
  const h = 22;
  const min = Math.min(reference, ...values);
  const max = Math.max(reference, ...values);
  const span = max - min || 1;
  const y = (v: number) => h - 2 - ((v - min) / span) * (h - 4);
  const points = values.map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = values[values.length - 1];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
      className={cn("overflow-visible", upDownClass(last - reference), className)}
    >
      <line x1={0} x2={w} y1={y(reference)} y2={y(reference)} className="stroke-gray-600" strokeWidth={1} strokeDasharray="1.5 2.5" vectorEffect="non-scaling-stroke" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
