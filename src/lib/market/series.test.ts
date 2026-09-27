import { describe, expect, it } from "vitest";
import { COMPANY_LIST } from "@/lib/data/companies";
import { chartData, SERIES } from "./series";

describe("synthetic price series", () => {
  it.each(COMPANY_LIST.map((c) => [c.profile.ticker, c] as const))("%s is anchored to its quote seed", (ticker, c) => {
    const s = SERIES[ticker];
    expect(s.daily).toHaveLength(252);
    expect(s.daily[0].close).toBeCloseTo(c.quote.yearAgo, 6);
    expect(s.daily.at(-2)!.close).toBeCloseTo(c.quote.prevClose, 6);
    expect(s.daily.at(-1)!.close).toBe(c.quote.last);
    expect(s.daily.every((p) => ![0, 6].includes(new Date(p.t).getUTCDay()))).toBe(true);

    expect(s.intraday).toHaveLength(79);
    expect(s.intraday.at(-1)!.close).toBeCloseTo(c.quote.last, 6);
    expect(s.intraday.reduce((sum, p) => sum + p.volume, 0)).toBeCloseTo(c.quote.volume, 0);
    expect(s.dayLow).toBeLessThanOrEqual(s.dayHigh);
    expect(s.low52).toBeLessThanOrEqual(c.quote.last);
    expect(s.high52).toBeGreaterThanOrEqual(c.quote.last);
  });

  it("splices the live price into the last point of every range", () => {
    const live = { price: 200, prevClose: 184.12, volume: 170_000_000 };
    for (const range of ["1D", "1M", "3M", "6M", "YTD", "1Y"] as const) {
      const data = chartData("NVDA", range, live, 168_400_000);
      expect(data.at(-1)!.close).toBe(200);
      expect(data.every((p) => p.upVol + p.downVol === p.volume)).toBe(true);
    }
    expect(chartData("NVDA", "1M", live, 168_400_000)).toHaveLength(22);
    expect(chartData("NVDA", "1D", live, 168_400_000)).toHaveLength(79);
    expect(new Date(chartData("NVDA", "YTD", live, 168_400_000)[0].t).getUTCFullYear()).toBe(2026);
  });
});
