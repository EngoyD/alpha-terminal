import { REPORT_API, STATIC_EXPORT } from "./config";
import { AIReportEnvelopeSchema, type AIReportEnvelope } from "./schema";

/** Longer than a typical live model call, shorter than the route's 300s budget. */
const REQUEST_TIMEOUT_MS = 180_000;

async function localMock(ticker: string): Promise<AIReportEnvelope> {
  const { generateMockEnvelope } = await import("./mock");
  return generateMockEnvelope(ticker);
}

/**
 * Fetches a report from the report API and validates it against the shared schema.
 * Static builds without an API (or that can't reach it) run the mock provider locally.
 */
export async function requestAIReport(ticker: string): Promise<AIReportEnvelope> {
  if (!REPORT_API) return localMock(ticker);

  let res: Response;
  try {
    res = await fetch(REPORT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new Error("The report took too long to generate. Try again.");
    }
    if (STATIC_EXPORT) return localMock(ticker);
    throw new Error("Could not reach the report service.");
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : `Report request failed (${res.status})`;
    throw new Error(message);
  }

  const parsed = AIReportEnvelopeSchema.safeParse(body);
  if (!parsed.success) throw new Error("Report did not match the AIReport schema");
  return parsed.data;
}

/** Epoch ms until which a shared cached report can't be regenerated, or null. */
export function reportLockedUntil(envelope: AIReportEnvelope, now: number): number | null {
  const until = envelope.meta.cachedUntil ? Date.parse(envelope.meta.cachedUntil) : NaN;
  return Number.isFinite(until) && until > now ? until : null;
}
