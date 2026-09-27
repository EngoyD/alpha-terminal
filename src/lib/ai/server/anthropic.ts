import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { monthsOfRunway } from "@/lib/data/companies";
import { fmtCompact, fmtUsdCompact } from "@/lib/format";
import type { Company } from "@/lib/types";
import { AIReportSchema, type AIReport } from "../schema";
import { ReportError } from "./errors";

export const CLAUDE_MODEL = "claude-opus-5";

const SYSTEM_PROMPT = `You are the fundamental-research engine inside a professional trading terminal. Write a concise, structured equity report for traders.

Ground the analysis in the company's public filings (10-K, 10-Q, 8-K), earnings calls and well-established industry context. Treat the snapshot in the request as the current state of the company, even where it differs from what you remember. Risk factors should paraphrase disclosures from the filings and cite the section. Catalysts must be upcoming relative to today's date. Be specific and decision-useful; skip statements that would apply to any company.`;

let client: Anthropic | undefined;

function buildPrompt(c: Company, today: string): string {
  const f = c.fundamentals;
  const runway = monthsOfRunway(f.cash, f.quarterlyOpCashFlow);
  return [
    `Today is ${today}. Write the report for ${c.profile.name} (${c.profile.exchange}: ${c.profile.ticker}).`,
    "",
    "Company snapshot:",
    `- Sector: ${c.profile.sector} / ${c.profile.industry}`,
    `- Business: ${c.profile.description}`,
    `- Last price $${c.quote.last}; ${fmtCompact(c.quote.sharesOutstanding)} shares outstanding`,
    `- Latest filing: ${f.form} ${f.period}, filed ${f.filedAt}; annual report: ${f.annualReport}`,
    `- Cash and securities ${fmtUsdCompact(f.cash)}; total debt ${fmtUsdCompact(f.totalDebt)}; quarterly operating cash flow ${fmtUsdCompact(f.quarterlyOpCashFlow)}${runway === null ? "" : ` (about ${Math.round(runway)} months of runway)`}`,
    `- Revenue TTM ${fmtUsdCompact(f.revenueTTM)}; net income TTM ${fmtUsdCompact(f.netIncomeTTM)}`,
    `- Recent headlines: ${c.news.map((n) => n.headline).join(" | ")}`,
    "",
    "Include three moat advantages, three to five upcoming catalysts in date order, and three to five risk factors ordered by severity.",
  ].join("\n");
}

/**
 * Claude provider. Structured outputs constrain the response to AIReportSchema, and
 * server-side fallbacks retry on another model if this one declines the request.
 */
export async function generateWithClaude(company: Company, today: string): Promise<{ report: AIReport; model: string }> {
  client ??= new Anthropic();
  try {
    const response = await client.beta.messages.parse({
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { format: betaZodOutputFormat(AIReportSchema) },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(company, today) }],
    });

    if (response.stop_reason === "refusal") throw new ReportError(422, "The model declined to write this report.");
    if (response.stop_reason === "max_tokens") throw new ReportError(502, "The report was cut off before it finished.");
    if (!response.parsed_output) throw new ReportError(502, "Model output did not match the AIReport schema.");

    return { report: { ...response.parsed_output, ticker: company.profile.ticker }, model: response.model };
  } catch (err) {
    if (err instanceof ReportError) throw err;
    if (err instanceof Anthropic.AuthenticationError) {
      throw new ReportError(500, "Anthropic credentials are missing or invalid. Set ANTHROPIC_API_KEY.");
    }
    if (err instanceof Anthropic.RateLimitError) throw new ReportError(429, "Rate limited by the Anthropic API. Try again shortly.");
    if (err instanceof Anthropic.APIError) throw new ReportError(502, `Anthropic API error (${err.status ?? "network"}).`);
    throw err;
  }
}
