import "server-only";
import { COMPANIES } from "@/lib/data/companies";
import { AIReportSchema, type AIReport, type AIReportEnvelope } from "../schema";
import { ReportError } from "./errors";
import { getMockReport } from "./fixtures";

export type Provider = AIReportEnvelope["meta"]["provider"];

export const MOCK_MODEL = "alpha-mock-v2";

/** `AI_PROVIDER=anthropic` switches to Claude; anything else keeps the offline mock. */
export function activeProvider(): Provider {
  return process.env.AI_PROVIDER === "anthropic" ? "anthropic" : "mock";
}

export async function activeModel(): Promise<string> {
  if (activeProvider() === "mock") return MOCK_MODEL;
  const { CLAUDE_MODEL } = await import("./anthropic");
  return CLAUDE_MODEL;
}

async function generateMock(ticker: string): Promise<{ report: AIReport; model: string }> {
  // Simulated inference latency.
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 900));
  // Fixtures go through the same validation a live model response would.
  const parsed = AIReportSchema.safeParse(getMockReport(ticker));
  if (!parsed.success) throw new ReportError(500, "Mock report failed schema validation.");
  return { report: parsed.data, model: MOCK_MODEL };
}

export async function generateReport(ticker: string): Promise<AIReportEnvelope> {
  const company = COMPANIES[ticker];
  if (!company) throw new ReportError(404, "No coverage for this ticker.");

  const started = Date.now();
  const provider = activeProvider();
  let result: { report: AIReport; model: string };
  if (provider === "anthropic") {
    const { generateWithClaude } = await import("./anthropic");
    result = await generateWithClaude(company, new Date().toISOString().slice(0, 10));
  } else {
    result = await generateMock(ticker);
  }

  return {
    report: result.report,
    meta: {
      provider,
      model: result.model,
      generatedAt: new Date().toISOString(),
      latencyMs: Date.now() - started,
    },
  };
}
