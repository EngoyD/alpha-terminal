import { ReportError } from "@/lib/ai/server/errors";
import { activeModel, activeProvider, generateReport } from "@/lib/ai/server/generate";
import { createRateLimiter } from "@/lib/ai/server/rate-limit";

// Live model calls can take a minute or more.
export const maxDuration = 300;

const TICKER = /^[A-Z][A-Z.]{0,9}$/;
const limiter = createRateLimiter(20, 10 * 60_000);

/** Origins allowed to call this API from the browser, e.g. the GitHub Pages build. */
function allowedOrigins(): string[] {
  return (process.env.REPORT_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins().includes(origin)) return { Vary: "Origin" };
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

/** Which provider and model the Generate button will use. */
export function GET(request: Request) {
  return Response.json({ provider: activeProvider(), model: activeModel() }, { headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const headers = corsHeaders(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400, headers });
  }

  const raw = body && typeof body === "object" && "ticker" in body ? body.ticker : undefined;
  const ticker = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  if (!TICKER.test(ticker)) {
    return Response.json({ error: "Invalid ticker." }, { status: 400, headers });
  }

  // Only the paid provider needs protecting; mock reports cost nothing.
  if (activeProvider() === "anthropic") {
    const limit = limiter(clientKey(request));
    if (!limit.ok) {
      return Response.json(
        { error: `Too many report requests. Try again in ${limit.retryAfterS}s.` },
        { status: 429, headers: { ...headers, "Retry-After": String(limit.retryAfterS) } },
      );
    }
  }

  try {
    return Response.json(await generateReport(ticker), { headers });
  } catch (err) {
    if (err instanceof ReportError) {
      if (err.status >= 500) console.error("[ai-report]", err.message);
      return Response.json({ error: err.message }, { status: err.status, headers });
    }
    console.error("[ai-report] unexpected failure", err);
    return Response.json({ error: "Report generation failed." }, { status: 500, headers });
  }
}
