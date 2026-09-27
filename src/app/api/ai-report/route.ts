import { ReportError } from "@/lib/ai/server/errors";
import { activeModel, activeProvider, generateReport } from "@/lib/ai/server/generate";

const TICKER = /^[A-Z][A-Z.]{0,9}$/;

/** Which provider and model the Generate button will use. */
export async function GET() {
  return Response.json({ provider: activeProvider(), model: await activeModel() });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const raw = body && typeof body === "object" && "ticker" in body ? body.ticker : undefined;
  const ticker = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  if (!TICKER.test(ticker)) {
    return Response.json({ error: "Invalid ticker." }, { status: 400 });
  }

  try {
    return Response.json(await generateReport(ticker));
  } catch (err) {
    if (err instanceof ReportError) {
      if (err.status >= 500) console.error("[ai-report]", err.message);
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[ai-report] unexpected failure", err);
    return Response.json({ error: "Report generation failed." }, { status: 500 });
  }
}
