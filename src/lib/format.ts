export const MINUS = "−";

const formatters = new Map<number, Intl.NumberFormat>();

function fixed(decimals: number): Intl.NumberFormat {
  let f = formatters.get(decimals);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatters.set(decimals, f);
  }
  return f;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function priceDecimals(n: number): number {
  return Math.abs(n) < 1 ? 4 : 2;
}

export function fmtNum(n: number, decimals = 2): string {
  const s = fixed(decimals).format(Math.abs(n));
  return n < 0 ? MINUS + s : s;
}

export function fmtPrice(n: number): string {
  return fmtNum(n, priceDecimals(n));
}

export function fmtSigned(n: number, decimals = 2): string {
  const s = fixed(decimals).format(Math.abs(n));
  if (s === fixed(decimals).format(0)) return s;
  return (n > 0 ? "+" : MINUS) + s;
}

/** `fraction` is 0.0126 for +1.26%. */
export function fmtPct(fraction: number, decimals = 2, signed = true): string {
  const pct = fraction * 100;
  return (signed ? fmtSigned(pct, decimals) : fmtNum(pct, decimals)) + "%";
}

const UNITS: [number, string][] = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

export function fmtCompact(n: number, decimals = 2): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? MINUS : "";
  for (const [size, unit] of UNITS) {
    if (abs >= size) {
      const v = abs / size;
      return sign + fixed(v >= 100 ? Math.min(decimals, 1) : decimals).format(v) + unit;
    }
  }
  return sign + fixed(0).format(abs);
}

export function fmtUsdCompact(n: number, decimals = 2): string {
  const s = fmtCompact(Math.abs(n), decimals);
  return (n < 0 ? MINUS : "") + "$" + s;
}

export function fmtAgo(ms: number): string {
  const s = Math.max(0, ms) / 1000;
  if (s < 45) return "now";
  const m = s / 60;
  if (m < 60) return `${Math.max(1, Math.round(m))}m`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)}h`;
  return `${Math.floor(h / 24)}d`;
}

const NY_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const NY_DATE = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const zoneClocks = new Map<string, Intl.DateTimeFormat>();

/** HH:MM:SS in New York, or HH:MM in another zone. */
export function fmtClock(ms: number, timeZone?: string): string {
  if (!timeZone) return NY_TIME.format(ms);
  let f = zoneClocks.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false });
    zoneClocks.set(timeZone, f);
  }
  return f.format(ms);
}

/** "SAT 26 SEP 2026" */
export function fmtNyDate(ms: number): string {
  const parts = NY_DATE.formatToParts(ms);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`.toUpperCase();
}

const UTC_DAY = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const UTC_MONTH = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
const UTC_FULL = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const NY_HM = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function fmtDay(t: number): string {
  return UTC_DAY.format(t);
}

export function fmtMonth(t: number): string {
  return UTC_MONTH.format(t).replace(" ", " '");
}

export function fmtFullDate(t: number): string {
  return UTC_FULL.format(t);
}

export function fmtNyHm(t: number): string {
  return NY_HM.format(t);
}

/** "2026-10-27" → epoch ms at UTC midnight. */
export function isoDay(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
