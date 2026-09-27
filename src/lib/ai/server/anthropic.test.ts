import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { COMPANIES } from "@/lib/data/companies";
import { getMockReport } from "../fixtures";
import { generateWithClaude } from "./anthropic";

// A local stand-in for the Messages API, so the real SDK request and response
// handling is exercised without network access or cost.
type Captured = { headers: IncomingHttpHeaders; body: Record<string, unknown> };
let server: Server;
let requests: Captured[] = [];
let replies: { status: number; body: unknown }[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      requests.push({ headers: req.headers, body: JSON.parse(raw) });
      const reply = replies.shift() ?? { status: 500, body: apiError("api_error", "no reply queued") };
      res.writeHead(reply.status, { "content-type": "application/json", "x-should-retry": "false" });
      res.end(JSON.stringify(reply.body));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  process.env.ANTHROPIC_API_KEY = "test-key";
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

beforeEach(() => {
  requests = [];
  replies = [];
});

function message(text: string, stopReason = "end_turn") {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-opus-5",
    content: [{ type: "text", text }],
    stop_reason: stopReason,
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 10 },
  };
}

function apiError(type: string, text: string) {
  return { type: "error", error: { type, message: text } };
}

function objectNodes(node: unknown, found: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(node)) node.forEach((n) => objectNodes(n, found));
  else if (node && typeof node === "object") {
    const record = node as Record<string, unknown>;
    if (record.type === "object") found.push(record);
    Object.values(record).forEach((v) => objectNodes(v, found));
  }
  return found;
}

const report = getMockReport("NVDA")!;
const run = () => generateWithClaude(COMPANIES.NVDA, "2026-09-26");

describe("generateWithClaude", () => {
  it("sends a structured-output request with fallbacks and parses the report", async () => {
    replies.push({ status: 200, body: message(JSON.stringify({ ...report, ticker: "WRONG" })) });
    const result = await run();

    expect(result.report.ticker).toBe("NVDA");
    expect(result.report.summary).toBe(report.summary);
    expect(result.model).toBe("claude-opus-5");

    const [{ headers, body }] = requests;
    expect(headers["x-api-key"]).toBe("test-key");
    expect(headers["anthropic-beta"]).toContain("server-side-fallback-2026-07-01");
    expect(body).toMatchObject({ model: "claude-opus-5", max_tokens: 16000, fallbacks: "default" });
    expect(body.betas).toBeUndefined();
    expect(JSON.stringify(body.messages)).toContain("Today is 2026-09-26");

    // Structured outputs need closed objects and reject numeric bounds.
    const format = (body.output_config as { format: { type: string; schema: unknown } }).format;
    expect(format.type).toBe("json_schema");
    const objects = objectNodes(format.schema);
    expect(objects.length).toBeGreaterThan(5);
    expect(objects.every((o) => o.additionalProperties === false)).toBe(true);
    expect(JSON.stringify(format.schema)).not.toMatch(/"(minimum|maximum)"/);
  });

  it("retries without fallbacks when the account can't use them", async () => {
    replies.push({ status: 400, body: apiError("invalid_request_error", "fallbacks: not available for this organization") });
    replies.push({ status: 200, body: message(JSON.stringify(report)) });
    await run();

    expect(requests).toHaveLength(2);
    expect(requests[1].body.fallbacks).toBeUndefined();
    expect(requests[1].headers["anthropic-beta"] ?? "").not.toContain("server-side-fallback");
  });

  it("maps refusals, truncation and invalid output to clear errors", async () => {
    replies.push({ status: 200, body: message("I can't help with that.", "refusal") });
    await expect(run()).rejects.toMatchObject({ status: 422 });

    replies.push({ status: 200, body: message('{"ticker": "NV', "max_tokens") });
    await expect(run()).rejects.toMatchObject({ status: 502, message: expect.stringContaining("cut off") });

    replies.push({ status: 200, body: message(JSON.stringify({ ...report, confidence: 1.5 })) });
    await expect(run()).rejects.toMatchObject({ status: 502, message: expect.stringContaining("schema") });
  });

  it("maps API errors to route statuses", async () => {
    replies.push({ status: 401, body: apiError("authentication_error", "invalid x-api-key") });
    await expect(run()).rejects.toMatchObject({ status: 500, message: expect.stringContaining("ANTHROPIC_API_KEY") });

    replies.push({ status: 429, body: apiError("rate_limit_error", "slow down") });
    await expect(run()).rejects.toMatchObject({ status: 429 });

    replies.push({ status: 529, body: apiError("overloaded_error", "overloaded") });
    await expect(run()).rejects.toMatchObject({ status: 502 });
  });
});
