import { AIReportEnvelopeSchema, type AIReportEnvelope } from "./schema";

/** Calls the report route and validates the response against the shared schema. */
export async function requestAIReport(ticker: string, signal?: AbortSignal): Promise<AIReportEnvelope> {
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
