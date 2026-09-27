import "server-only";
import { COMPANIES } from "@/lib/data/companies";
import { MOCK_MODEL } from "../config";
import { generateMockEnvelope } from "../mock";
import type { AIReportEnvelope } from "../schema";
import { ReportError } from "./errors";

export type Provider = AIReportEnvelope["meta"]["provider"];

/** `AI_PROVIDER=anthropic` switches to Claude; anything else keeps the offline mock. */
export function activeProvider(): Provider {
  return process.env.AI_PROVIDER === "anthropic" ? "anthropic" : "mock";
}

export async function activeModel(): Promise<string> {
  if (activeProvider() === "mock") return MOCK_MODEL;
  const { CLAUDE_MODEL } = await import("./anthropic");
  return CLAUDE_MODEL;
}

export async function generateReport(ticker: string): Promise<AIReportEnvelope> {
  const company = COMPANIES[ticker];
  if (!company) throw new ReportError(404, "No coverage for this ticker.");
  if (activeProvider() === "mock") return generateMockEnvelope(ticker);

  const started = Date.now();
  const { generateWithClaude } = await import("./anthropic");
  const { report, model } = await generateWithClaude(company, new Date().toISOString().slice(0, 10));
  return {
    report,
    meta: {
      provider: "anthropic",
      model,
      generatedAt: new Date().toISOString(),
      latencyMs: Date.now() - started,
    },
  };
}
