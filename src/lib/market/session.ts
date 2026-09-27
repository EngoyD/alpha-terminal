export type SessionPhase = "open" | "pre" | "post" | "lunch" | "closed";

export interface ExchangeStatus {
  id: "NYSE" | "LSE" | "TSE";
  city: string;
  timeZone: string;
  phase: SessionPhase;
  detail: string;
}

// NYSE full-day closures.
const NYSE_HOLIDAYS = new Set([
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19",
  "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31", "2027-06-18",
  "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24",
]);

const partFormatters = new Map<string, Intl.DateTimeFormat>();

function zoned(ms: number, timeZone: string) {
  let f = partFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    partFormatters.set(timeZone, f);
  }
  const parts = f.formatToParts(ms);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: get("weekday"),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function isWeekend(weekday: string) {
  return weekday === "Sat" || weekday === "Sun";
}

function duration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function nextNyseOpen(ymd: string, includeToday: boolean): string {
  const [y, m, d] = ymd.split("-").map(Number);
  for (let i = includeToday ? 0 : 1; i < 10; i++) {
    const t = new Date(Date.UTC(y, m - 1, d + i));
    const key = t.toISOString().slice(0, 10);
    const dow = t.getUTCDay();
    if (dow === 0 || dow === 6 || NYSE_HOLIDAYS.has(key)) continue;
    return i === 0 ? "Opens 09:30" : i === 1 ? "Opens tomorrow 09:30" : `Opens ${WEEKDAYS[dow]} 09:30`;
  }
  return "Closed";
}

function nyse(ms: number): ExchangeStatus {
  const base = { id: "NYSE" as const, city: "New York", timeZone: "America/New_York" };
  const { ymd, weekday, minutes } = zoned(ms, base.timeZone);
  if (isWeekend(weekday) || NYSE_HOLIDAYS.has(ymd)) {
    return { ...base, phase: "closed", detail: nextNyseOpen(ymd, false) };
  }
  if (minutes >= 570 && minutes < 960) return { ...base, phase: "open", detail: `Closes in ${duration(960 - minutes)}` };
  if (minutes >= 240 && minutes < 570) return { ...base, phase: "pre", detail: `Opens in ${duration(570 - minutes)}` };
  if (minutes >= 960 && minutes < 1200) return { ...base, phase: "post", detail: `Ends in ${duration(1200 - minutes)}` };
  return { ...base, phase: "closed", detail: nextNyseOpen(ymd, minutes < 240) };
}

function simple(
  id: "LSE" | "TSE",
  city: string,
  timeZone: string,
  sessions: [number, number][],
): (ms: number) => ExchangeStatus {
  return (ms) => {
    const { weekday, minutes } = zoned(ms, timeZone);
    const base = { id, city, timeZone };
    if (isWeekend(weekday)) return { ...base, phase: "closed", detail: "Weekend" };
    for (const [open, close] of sessions) {
      if (minutes >= open && minutes < close) return { ...base, phase: "open", detail: `Closes in ${duration(close - minutes)}` };
    }
    if (sessions.length > 1 && minutes >= sessions[0][1] && minutes < sessions[1][0]) {
      return { ...base, phase: "lunch", detail: `Resumes in ${duration(sessions[1][0] - minutes)}` };
    }
    if (minutes < sessions[0][0]) return { ...base, phase: "closed", detail: `Opens in ${duration(sessions[0][0] - minutes)}` };
    return { ...base, phase: "closed", detail: "Closed" };
  };
}

const lse = simple("LSE", "London", "Europe/London", [[480, 990]]);
const tse = simple("TSE", "Tokyo", "Asia/Tokyo", [
  [540, 690],
  [750, 930],
]);

export function exchangeStatuses(ms: number): ExchangeStatus[] {
  return [nyse(ms), lse(ms), tse(ms)];
}
