import "server-only";
import { unstable_cache } from "next/cache";
import { COMPANIES } from "@/lib/data/companies";
import { CLAUDE_MODEL, LIVE_REPORT_TTL_HOURS, MOCK_MODEL } from "../config";
import { generateMockEnvelope } from "../mock";
import type { AIReportEnvelope } from "../schema";
import { ReportError } from "./errors";

export type Provider = AIReportEnvelope["meta"]["provider"];

const TTL_MS = LIVE_REPORT_TTL_HOURS * 3_600_000;
let warnedMissingKey = false;

/**
 * `AI_PROVIDER=anthropic` switches to Claude. Without credentials the site keeps
 * working on the mock provider, and the server log says why.
 */
export function activeProvider(): Provider {
  if (process.env.AI_PROVIDER !== "anthropic") return "mock";
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return "anthropic";
  if (!warnedMissingKey) {
    warnedMissingKey = true;
    console.warn("[ai-report] AI_PROVIDER=anthropic but ANTHROPIC_API_KEY is not set; serving mock reports.");
  }
  return "mock";
}

export function activeModel(): string {
  return activeProvider() === "anthropic" ? CLAUDE_MODEL : MOCK_MODEL;
}

/**
 * At most one model call per ticker per TTL. The Next.js data cache persists across
 * requests, serverless instances and deploys, so every visitor shares the result.
 */
const cachedLiveReport = unstable_cache(
  async (ticker: string): Promise<AIReportEnvelope> => {
    const started = Date.now();
    const { generateWithClaude } = await import("./anthropic");
    const { report, model } = await generateWithClaude(COMPANIES[ticker], new Date().toISOString().slice(0, 10));
    const generatedAt = Date.now();
    return {
      report,
      meta: {
        provider: "anthropic",
        model,
        generatedAt: new Date(generatedAt).toISOString(),
        latencyMs: generatedAt - started,
        cached: false,
        cachedUntil: new Date(generatedAt + TTL_MS).toISOString(),
      },
    };
  },
  ["ai-report", CLAUDE_MODEL],
  { revalidate: LIVE_REPORT_TTL_HOURS * 3600, tags: ["ai-report"] },
);

// Concurrent requests for the same ticker on one instance share a single model call.
const inflight = new Map<string, Promise<AIReportEnvelope>>();

function liveReport(ticker: string): Promise<AIReportEnvelope> {
  let pending = inflight.get(ticker);
  if (!pending) {
    pending = cachedLiveReport(ticker).finally(() => inflight.delete(ticker));
    inflight.set(ticker, pending);
  }
  return pending;
}

export async function generateReport(ticker: string): Promise<AIReportEnvelope> {
  if (!COMPANIES[ticker]) throw new ReportError(404, "No coverage for this ticker.");
  if (activeProvider() === "mock") return generateMockEnvelope(ticker);

  const requestedAt = Date.now();
  const envelope = await liveReport(ticker);
  // A report generated before this request arrived came from the cache.
  return { ...envelope, meta: { ...envelope.meta, cached: Date.parse(envelope.meta.generatedAt) < requestedAt } };
}
