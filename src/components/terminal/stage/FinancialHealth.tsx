"use client";

import { Landmark } from "lucide-react";
import type { ReactNode } from "react";
import { monthsOfRunway } from "@/lib/data/companies";
import { cn, fmtDay, fmtNum, fmtPct, fmtUsdCompact, isoDay } from "@/lib/format";
import type { Company, Tone } from "@/lib/types";
import { Panel } from "../ui/Panel";
import { TONE, ToneChip } from "../ui/primitives";

/** Runway meter spans 0–36 months; anything beyond reads as full. */
const RUNWAY_SCALE = 36;
const RUNWAY_LABEL: Record<Tone, string> = { good: "Healthy", warning: "Watch", critical: "Critical", neutral: "" };

function runwayTone(months: number | null): Tone {
  if (months === null || months >= 24) return "good";
  return months < 12 ? "critical" : "warning";
}

function Tile({
  label,
  value,
  sub,
  valueClass,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded border border-gray-800/80 bg-gray-950/40 px-2.5 py-2">
      <span className="truncate text-[10.5px] text-gray-400">{label}</span>
      <span className={cn("mt-0.5 truncate font-mono text-[14px] leading-tight font-semibold text-gray-100 2xl:text-[15px]", valueClass)}>
        {value}
      </span>
      {sub && <span className="mt-0.5 truncate text-[10.5px] text-gray-400">{sub}</span>}
      {children}
    </div>
  );
}

export function FinancialHealth({ company, className }: { company: Company; className?: string }) {
  const f = company.fundamentals;
  const burn = f.quarterlyOpCashFlow < 0;
  const runway = monthsOfRunway(f.cash, f.quarterlyOpCashFlow);
  const tone = runwayTone(runway);
  const toneStyle = TONE[tone];
  const runwayFill = Math.min(1, (runway ?? RUNWAY_SCALE) / RUNWAY_SCALE);
  const netCash = f.cash - f.totalDebt;
  const netMargin = f.revenueTTM > 0 ? f.netIncomeTTM / f.revenueTTM : null;
  const crowdedShort = f.shortInterest > 0.1;

  return (
    <Panel
      code="FA"
      title="Financial Health"
      icon={Landmark}
      className={className}
      bodyClassName="overflow-y-auto p-2"
    >
      <div className="grid grid-cols-2 gap-1.5">
        <Tile label="Cash & equivalents" value={fmtUsdCompact(f.cash)} sub="incl. marketable securities" />
        <Tile
          label={burn ? "Quarterly burn" : "Operating cash flow"}
          value={burn ? fmtUsdCompact(-f.quarterlyOpCashFlow) : `+${fmtUsdCompact(f.quarterlyOpCashFlow)}`}
          valueClass={burn ? "text-red-300" : "text-emerald-300"}
          sub={burn ? "cash used in operations / qtr" : "generated per quarter"}
        />
        <Tile label="Months of runway" value={runway === null ? "Self-funded" : `${fmtNum(runway, 1)} mo`}>
          <div className="mt-1.5 flex items-center gap-1.5">
            <div
              role="meter"
              aria-label="Cash runway"
              aria-valuemin={0}
              aria-valuemax={RUNWAY_SCALE}
              aria-valuenow={Math.round(runwayFill * RUNWAY_SCALE)}
              aria-valuetext={runway === null ? "Cash-flow positive" : `${fmtNum(runway, 1)} months, ${RUNWAY_LABEL[tone]}`}
              className="h-1 min-w-6 flex-1 overflow-hidden rounded-full bg-gray-800"
            >
              <div className={cn("h-full rounded-full", toneStyle.bar)} style={{ width: `${runwayFill * 100}%` }} />
            </div>
            <span className={cn("inline-flex shrink-0 items-center gap-0.5 text-[10px] font-semibold", toneStyle.text)}>
              <toneStyle.Icon aria-hidden className="size-3" />
              {runway === null ? "Positive" : RUNWAY_LABEL[tone]}
            </span>
          </div>
        </Tile>
        <Tile
          label="Total debt"
          value={fmtUsdCompact(f.totalDebt)}
          sub={netCash >= 0 ? `Net cash ${fmtUsdCompact(netCash)}` : `Net debt ${fmtUsdCompact(-netCash)}`}
        />
        <Tile
          label="Revenue (TTM)"
          value={f.revenueTTM > 0 ? fmtUsdCompact(f.revenueTTM) : "None"}
          sub={f.revenueTTM > 0 ? (f.grossMargin === null ? "trailing twelve months" : `${fmtPct(f.grossMargin, 0, false)} gross margin`) : "Pre-revenue"}
        />
        <Tile
          label="Net income (TTM)"
          value={fmtUsdCompact(f.netIncomeTTM)}
          valueClass={f.netIncomeTTM < 0 ? "text-red-300" : undefined}
          sub={netMargin === null ? "Net loss, pre-revenue" : `${fmtPct(netMargin, 0, false)} net margin`}
        />
        <Tile
          label="Short interest"
          value={fmtPct(f.shortInterest, 1, false)}
          valueClass={crowdedShort ? "text-amber-300" : undefined}
          sub={crowdedShort ? "of float · crowded" : "of float"}
        />
        <Tile label="Institutional" value={fmtPct(f.institutionalOwnership, 0, false)} sub="ownership" />
      </div>

      <div className="mt-2.5">
        <div className="mb-1 text-[10px] tracking-wider text-gray-400 uppercase">
          SEC flags · {f.form} {f.period} · filed {fmtDay(isoDay(f.filedAt))}
        </div>
        <div className="flex flex-wrap gap-1">
          {f.flags.map((flag) => (
            <ToneChip key={flag.label} tone={flag.tone}>
              {flag.label}
            </ToneChip>
          ))}
        </div>
      </div>
    </Panel>
  );
}
