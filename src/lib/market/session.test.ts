import { describe, expect, it } from "vitest";
import { exchangeStatuses } from "./session";

// September 2026 is EDT (UTC−4).
const nyse = (iso: string) => exchangeStatuses(Date.parse(iso))[0];

describe("NYSE session", () => {
  it("tracks pre-market, regular and after-hours trading", () => {
    expect(nyse("2026-09-25T12:00:00Z")).toMatchObject({ phase: "pre", detail: "Opens in 1h 30m" });
    expect(nyse("2026-09-25T14:00:00Z")).toMatchObject({ phase: "open", detail: "Closes in 6h 00m" });
    expect(nyse("2026-09-25T21:00:00Z")).toMatchObject({ phase: "post", detail: "Ends in 3h 00m" });
    expect(nyse("2026-09-26T01:00:00Z")).toMatchObject({ phase: "closed", detail: "Opens Mon 09:30" });
  });

  it("stays closed on weekends and holidays", () => {
    expect(nyse("2026-09-26T16:00:00Z")).toMatchObject({ phase: "closed", detail: "Opens Mon 09:30" });
    expect(nyse("2026-11-26T15:00:00Z")).toMatchObject({ phase: "closed", detail: "Opens tomorrow 09:30" });
  });
});

describe("Tokyo session", () => {
  it("pauses for lunch", () => {
    expect(exchangeStatuses(Date.parse("2026-09-25T03:00:00Z"))[2]).toMatchObject({ phase: "lunch" });
  });
});
