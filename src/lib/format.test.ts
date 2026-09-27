import { describe, expect, it } from "vitest";
import { fmtAgo, fmtCompact, fmtPct, fmtPrice, fmtSigned, fmtUsdCompact, isoDay, MINUS } from "./format";

describe("format", () => {
  it("signs changes with a typographic minus and drops the sign on zero", () => {
    expect(fmtSigned(2.331)).toBe("+2.33");
    expect(fmtSigned(-2.331)).toBe(`${MINUS}2.33`);
    expect(fmtSigned(-0.001)).toBe("0.00");
    expect(fmtPct(0.0126)).toBe("+1.26%");
    expect(fmtPct(0.5, 0, false)).toBe("50%");
  });

  it("picks price precision by magnitude", () => {
    expect(fmtPrice(186.456)).toBe("186.46");
    expect(fmtPrice(0.68354)).toBe("0.6835");
    expect(fmtPrice(1234.5)).toBe("1,234.50");
  });

  it("compacts large numbers", () => {
    expect(fmtCompact(4.53e12)).toBe("4.53T");
    expect(fmtCompact(168_400_000, 1)).toBe("168.4M");
    expect(fmtCompact(123.4e9)).toBe("123.4B");
    expect(fmtCompact(950)).toBe("950");
    expect(fmtUsdCompact(-36.2e6)).toBe(`${MINUS}$36.20M`);
  });

  it("formats relative time", () => {
    expect(fmtAgo(10_000)).toBe("now");
    expect(fmtAgo(25 * 60_000)).toBe("25m");
    expect(fmtAgo(5 * 3_600_000)).toBe("5h");
    expect(fmtAgo(50 * 3_600_000)).toBe("2d");
  });

  it("parses ISO days and rejects approximate labels", () => {
    expect(isoDay("2026-10-27")).toBe(Date.UTC(2026, 9, 27));
    expect(isoDay("Q4 2026")).toBeNaN();
    expect(isoDay("2026-10")).toBeNaN();
  });
});
