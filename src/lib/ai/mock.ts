import { MOCK_MODEL } from "./config";
import { getMockReport } from "./fixtures";
import { AIReportSchema, type AIReportEnvelope } from "./schema";

/** Mock provider. Runs in the API route, or in the browser on static builds. */
export async function generateMockEnvelope(ticker: string): Promise<AIReportEnvelope> {
  const started = Date.now();
  // Simulated inference latency.
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 900));
  // Fixtures go through the same validation a live model response would.
  const parsed = AIReportSchema.safeParse(getMockReport(ticker));
  if (!parsed.success) throw new Error(`No mock report for ${ticker}.`);
  return {
    report: parsed.data,
    meta: {
      provider: "mock",
      model: MOCK_MODEL,
      generatedAt: new Date().toISOString(),
      latencyMs: Date.now() - started,
      cached: false,
      cachedUntil: null,
    },
  };
}
