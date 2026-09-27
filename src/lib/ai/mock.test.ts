import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COMPANY_LIST } from "@/lib/data/companies";
import { isoDay } from "@/lib/format";
import { generateMockEnvelope } from "./mock";
import { AIReportEnvelopeSchema } from "./schema";

describe("mock provider", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it.each(COMPANY_LIST.map((c) => c.profile.ticker))("%s has a schema-valid report", async (ticker) => {
    const pending = generateMockEnvelope(ticker);
    await vi.runAllTimersAsync();
    const envelope = AIReportEnvelopeSchema.parse(await pending);

    expect(envelope.report.ticker).toBe(ticker);
    expect(envelope.meta).toMatchObject({ provider: "mock", cached: false, cachedUntil: null });
    expect(envelope.report.business.advantages.length).toBeGreaterThanOrEqual(3);
    for (const event of envelope.report.catalysts.events) expect(isoDay(event.date)).not.toBeNaN();
    const shares = envelope.report.business.segments.reduce((sum, s) => sum + s.share, 0);
    if (envelope.report.business.segments.length) expect(shares).toBeCloseTo(1, 2);
  });

  it("rejects tickers without a report", async () => {
    const pending = generateMockEnvelope("GOOG");
    const assertion = expect(pending).rejects.toThrow("No mock report");
    await vi.runAllTimersAsync();
    await assertion;
  });
});
