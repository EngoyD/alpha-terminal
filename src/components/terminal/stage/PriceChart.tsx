"use client";

import { ChartArea } from "lucide-react";
import { useId, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { chartData, SESSION_DAY, type ChartPoint } from "@/lib/market/series";
import { cn, fmtCompact, fmtDay, fmtFullDate, fmtMonth, fmtNyHm, fmtPct, fmtPrice } from "@/lib/format";
import type { ChartRange, Company } from "@/lib/types";
import { useMarket } from "../TerminalProvider";
import { Panel } from "../ui/Panel";
import { upDownClass } from "../ui/primitives";

const RANGES: ChartRange[] = ["1D", "1M", "3M", "6M", "YTD", "1Y"];
const UP = "#00d492"; // emerald-400
const DOWN = "#ff6467"; // red-400
const GRID = "#1e2939"; // gray-800
const AXIS = "#99a1af"; // gray-400
const CROSSHAIR = "#6a7282"; // gray-500
const SURFACE = "#0b111e";
const Y_AXIS_WIDTH = 60;

const axisNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function formatTick(range: ChartRange) {
  return (t: number) => {
    if (range === "1D") return fmtNyHm(t);
    if (range === "1M" || range === "3M") return fmtDay(t);
    return fmtMonth(t);
  };
}

/** Ticks on calendar boundaries: hours (1D), Mondays (1M), 1st/15th (3M), month starts (longer ranges). */
function axisTicks(data: ChartPoint[], range: ChartRange): number[] {
  const at = (i: number) => new Date(data[i].t);
  return data
    .filter((p, i) => {
      const d = at(i);
      if (range === "1D") return d.getUTCMinutes() === 0;
      if (range === "1M") return d.getUTCDay() === 1;
      if (i === 0) return false;
      const prev = at(i - 1);
      const newMonth = d.getUTCMonth() !== prev.getUTCMonth();
      return range === "3M" ? newMonth || (d.getUTCDate() >= 15 && prev.getUTCDate() < 15) : newMonth;
    })
    .map((p) => p.t);
}

type PriceTooltipProps = Partial<TooltipContentProps<number, string>> & { range: ChartRange; base: number };

function PriceTooltip({ active, payload, range, base }: PriceTooltipProps) {
  const point = payload?.[0]?.payload as ChartPoint | undefined;
  if (!active || !point) return null;
  const change = point.close / base - 1;
  return (
    <div className="rounded border border-gray-700 bg-gray-950/95 px-2.5 py-2 font-mono text-[11px] leading-relaxed shadow-xl shadow-black/60">
      <div className="text-gray-400">{range === "1D" ? `${fmtNyHm(point.t)} ET` : fmtFullDate(point.t)}</div>
      <div className="text-sm font-semibold text-white">{fmtPrice(point.close)}</div>
      <div className={upDownClass(change)}>
        {fmtPct(change)} <span className="text-gray-400">vs. {range === "1D" ? "prev close" : "range start"}</span>
      </div>
      <div className="text-gray-400">
        Vol <span className="text-gray-200">{fmtCompact(point.volume, 1)}</span>
      </div>
    </div>
  );
}

function NoTooltip() {
  return null;
}

/** Direct end-label: the live price pinned to the right axis. */
function LastPriceTag({
  viewBox,
  value,
  color,
}: {
  viewBox?: { x?: number; y?: number; width?: number };
  value: number;
  color: string;
}) {
  if (!viewBox || viewBox.x === undefined || viewBox.y === undefined || viewBox.width === undefined) return null;
  const text = fmtPrice(value);
  const width = text.length * 6.6 + 10;
  const x = viewBox.x + viewBox.width + 3;
  return (
    <g>
      <rect x={x} y={viewBox.y - 9} width={width} height={18} rx={3} fill={color} />
      <text x={x + width / 2} y={viewBox.y + 3.5} textAnchor="middle" fill="#030712" fontSize={10.5} fontWeight={700}>
        {text}
      </text>
    </g>
  );
}

export function PriceChart({ company, className }: { company: Company; className?: string }) {
  const [range, setRange] = useState<ChartRange>("1Y");
  const { ticker } = company.profile;
  const q = useMarket().quotes[ticker];
  const gradientId = `gp-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const data = useMemo(
    () => chartData(ticker, range, { price: q.price, prevClose: q.prevClose, volume: q.volume }, company.quote.volume),
    [ticker, range, q.price, q.prevClose, q.volume, company.quote.volume],
  );

  const base = range === "1D" ? q.prevClose : data[0].close;
  const last = data[data.length - 1].close;
  const periodChange = last / base - 1;
  const color = periodChange >= 0 ? UP : DOWN;
  const closes = data.map((d) => d.close);
  const high = Math.max(...closes);
  const low = Math.min(...closes);
  const tickFormatter = formatTick(range);
  const ticks = axisTicks(data, range);

  return (
    <Panel
      code="GP"
      title={`${ticker} · Price`}
      icon={ChartArea}
      className={className}
      bodyClassName="flex flex-col"
      actions={
        <div role="group" aria-label="Chart range" className="flex items-center gap-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={r === range}
              onClick={() => setRange(r)}
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium transition-colors",
                r === range ? "bg-cyan-400/15 text-cyan-200" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 px-3 pt-2 font-mono text-[11px] text-gray-400 tabular-nums">
        <span>
          {range} <span className={cn("font-semibold", upDownClass(periodChange))}>{fmtPct(periodChange)}</span>
        </span>
        <span>
          H <span className="text-gray-200">{fmtPrice(high)}</span>
        </span>
        <span>
          L <span className="text-gray-200">{fmtPrice(low)}</span>
        </span>
        <span className="hidden sm:inline">
          {range === "1D" ? `Session ${fmtFullDate(SESSION_DAY)}` : `${data.length} sessions`}
        </span>
      </div>

      <div key={`${ticker}-${range}`} className="chart min-h-0 flex-1 animate-fade-in">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} syncId="gp" margin={{ top: 10, right: 0, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="t" hide />
            <YAxis
              orientation="right"
              domain={["auto", "auto"]}
              tickCount={5}
              width={Y_AXIS_WIDTH}
              axisLine={false}
              tickLine={false}
              tick={{ fill: AXIS, fontSize: 10 }}
              tickFormatter={(v: number) => axisNumber.format(v)}
            />
            {range === "1D" && (
              <ReferenceLine y={q.prevClose} stroke={CROSSHAIR} strokeDasharray="3 3" ifOverflow="extendDomain" />
            )}
            <Tooltip
              content={<PriceTooltip range={range} base={base} />}
              cursor={{ stroke: CROSSHAIR, strokeWidth: 1 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: SURFACE, strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <ReferenceLine
              y={last}
              stroke={color}
              strokeOpacity={0.4}
              strokeDasharray="2 3"
              ifOverflow="extendDomain"
              label={<LastPriceTag value={last} color={color} />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart h-[72px] shrink-0 border-t border-gray-800/60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} syncId="gp" margin={{ top: 6, right: 0, bottom: 0, left: 8 }} barCategoryGap={1}>
            <XAxis
              dataKey="t"
              ticks={ticks}
              tickFormatter={tickFormatter}
              minTickGap={24}
              axisLine={{ stroke: GRID }}
              tickLine={false}
              tick={{ fill: AXIS, fontSize: 10 }}
              height={20}
            />
            <YAxis
              orientation="right"
              width={Y_AXIS_WIDTH}
              axisLine={false}
              tickLine={false}
              tickCount={2}
              tick={{ fill: AXIS, fontSize: 9 }}
              tickFormatter={(v: number) => (v === 0 ? "VOL" : fmtCompact(v, 0))}
            />
            <Tooltip content={NoTooltip} cursor={{ fill: "rgb(255 255 255 / 0.05)" }} isAnimationActive={false} />
            <Bar dataKey="upVol" stackId="v" fill={UP} fillOpacity={0.5} maxBarSize={8} isAnimationActive={false} />
            <Bar dataKey="downVol" stackId="v" fill={DOWN} fillOpacity={0.5} maxBarSize={8} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
