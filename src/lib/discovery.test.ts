import { describe, expect, it } from "vitest";
import { COMPANY_LIST } from "@/lib/data/companies";
import { rankDiscovery } from "./discovery";

describe("rankDiscovery", () => {
  it("skips watchlist names, ranks by conviction and is stable per scan", () => {
    const watchlist = ["NVDA", "AAPL"];
    const picks = rankDiscovery(watchlist, 3);
    expect(picks).toHaveLength(4);
    expect(picks.some((s) => watchlist.includes(s.ticker))).toBe(false);
    expect(picks.map((s) => s.conviction)).toEqual([...picks.map((s) => s.conviction)].sort((a, b) => b - a));
    expect(rankDiscovery(watchlist, 3)).toEqual(picks);
  });

  it("returns nothing once every covered name is on the watchlist", () => {
    expect(rankDiscovery(COMPANY_LIST.map((c) => c.profile.ticker), 1)).toEqual([]);
  });
});
