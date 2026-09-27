import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMockReport } from "@/lib/ai/fixtures";
import { AIReportEnvelopeSchema } from "@/lib/ai/schema";
import { ReportError } from "@/lib/ai/server/errors";

// Outside Next there is no data cache; run the cached function directly.
vi.mock("next/cache", () => ({ unstable_cache: <T>(fn: T) => fn }));
const { generateWithClaude } = vi.hoisted(() => ({ generateWithClaude: vi.fn() }));
vi.mock("@/lib/ai/server/anthropic", () => ({ generateWithClaude }));

const { GET, OPTIONS, POST } = await import("./route.api");

let ip = 0;
function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new Request("http://localhost/api/ai-report", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${++ip}`, ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  generateWithClaude.mockReset();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function liveMode() {
  vi.stubEnv("AI_PROVIDER", "anthropic");
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  generateWithClaude.mockImplementation(async () => ({ report: getMockReport("NVDA")!, model: "claude-opus-5" }));
}

describe("POST /api/ai-report", () => {
  it("validates input", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post({ ticker: "<script>" })).status).toBe(400);
    expect((await post({ ticker: "GOOG" })).status).toBe(404);
  });

  it("serves mock reports by default", async () => {
    const res = await post({ ticker: "crsp" });
    expect(res.status).toBe(200);
    const envelope = AIReportEnvelopeSchema.parse(await res.json());
    expect(envelope.report.ticker).toBe("CRSP");
    expect(envelope.meta.provider).toBe("mock");
    expect(generateWithClaude).not.toHaveBeenCalled();
  });

  it("falls back to mock when the live provider has no key", async () => {
    vi.stubEnv("AI_PROVIDER", "anthropic");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(await GET(new Request("http://localhost/api/ai-report")).json()).toEqual({
      provider: "mock",
      model: "alpha-mock-v2",
    });
  });

  it("serves live reports with a cache window and shares concurrent calls", async () => {
    liveMode();
    const [a, b] = await Promise.all([post({ ticker: "NVDA" }), post({ ticker: "NVDA" })]);
    expect(generateWithClaude).toHaveBeenCalledTimes(1);

    const envelope = AIReportEnvelopeSchema.parse(await a.json());
    expect((await b.json()).meta.generatedAt).toBe(envelope.meta.generatedAt);
    expect(envelope.meta).toMatchObject({ provider: "anthropic", model: "claude-opus-5", cached: false });
    const window = Date.parse(envelope.meta.cachedUntil!) - Date.parse(envelope.meta.generatedAt);
    expect(window).toBe(12 * 3_600_000);
  });

  it("passes provider errors through with their status", async () => {
    liveMode();
    generateWithClaude.mockRejectedValueOnce(new ReportError(422, "The model declined to write this report."));
    const res = await post({ ticker: "SLS" });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "The model declined to write this report." });
  });

  it("rate-limits the live provider per client", async () => {
    liveMode();
    const client = { "x-forwarded-for": "203.0.113.7" };
    for (let i = 0; i < 20; i++) expect((await post({ ticker: "AAPL" }, client)).status).toBe(200);
    const limited = await post({ ticker: "AAPL" }, client);
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
    expect((await post({ ticker: "AAPL" })).status).toBe(200);
  });
});

describe("CORS", () => {
  it("allows configured origins only", async () => {
    vi.stubEnv("REPORT_ALLOWED_ORIGINS", "https://engoyd.github.io");
    const preflight = (origin: string) =>
      OPTIONS(new Request("http://localhost/api/ai-report", { method: "OPTIONS", headers: { origin } }));

    const allowed = preflight("https://engoyd.github.io");
    expect(allowed.status).toBe(204);
    expect(allowed.headers.get("access-control-allow-origin")).toBe("https://engoyd.github.io");
    expect(preflight("https://evil.example").headers.get("access-control-allow-origin")).toBeNull();

    const res = await post({ ticker: "!" }, { origin: "https://engoyd.github.io" });
    expect(res.headers.get("access-control-allow-origin")).toBe("https://engoyd.github.io");
  });
});
