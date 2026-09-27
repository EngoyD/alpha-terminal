import { STATIC_EXPORT } from "./config";
import { AIReportEnvelopeSchema, type AIReportEnvelope } from "./schema";

/** Fetches a report from the API route (validated against the shared schema), or runs the mock locally on static builds. */
export async function requestAIReport(ticker: string, signal?: AbortSignal): Promise<AIReportEnvelope> {
  if (STATIC_EXPORT) {
    // Static hosting has no API route; load the mock provider on demand and run it here.
    const { generateMockEnvelope } = await import("./mock");
    return generateMockEnvelope(ticker);
  }

  const res = await fetch("/api/ai-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker }),
    signal,
  });
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
