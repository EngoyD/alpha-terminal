import { describe, expect, it } from "vitest";
import { COMPANIES, COMPANY_LIST, DEFAULT_SELECTED, DEFAULT_WATCHLIST, monthsOfRunway, searchCompanies } from "./companies";

describe("company universe", () => {
  it("searches tickers before company names", () => {
    expect(searchCompanies("a")[0].profile.ticker).toBe("AAPL");
    expect(searchCompanies("viking")[0].profile.ticker).toBe("VKTX");
    expect(searchCompanies("zzz")).toEqual([]);
  });

  it("computes runway from quarterly burn", () => {
    expect(monthsOfRunway(30e6, -9e6)).toBeCloseTo(10);
    expect(monthsOfRunway(1e9, 5e6)).toBeNull();
  });

  it("keeps defaults inside the covered universe", () => {
    expect(DEFAULT_WATCHLIST.every((t) => t in COMPANIES)).toBe(true);
    expect(DEFAULT_SELECTED in COMPANIES).toBe(true);
  });

  it.each(COMPANY_LIST.map((c) => [c.profile.ticker, c] as const))("%s has EPS consistent with net income", (_, c) => {
    const implied = c.quote.epsTTM * c.quote.sharesOutstanding;
    expect(Math.abs(implied - c.fundamentals.netIncomeTTM) / Math.abs(c.fundamentals.netIncomeTTM)).toBeLessThan(0.1);
  });
});
