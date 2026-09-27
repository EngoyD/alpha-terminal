import { z } from "zod";

/**
 * The contract between the UI and any report generator: mock fixtures today,
 * Claude or Gemini later. One schema drives the TypeScript types, runtime
 * validation of model output, and the JSON Schema handed to providers that
 * support structured outputs (Claude `output_config.format`, Gemini `responseJsonSchema`).
 */
const Level = z.enum(["high", "medium", "low"]);

export const AIReportSchema = z.object({
  ticker: z.string().describe("Ticker symbol the report covers"),
  stance: z.enum(["bullish", "bearish", "neutral"]),
  confidence: z.number().min(0).max(1).describe("Confidence in the stance, from 0 to 1"),
  summary: z.string().describe("One-sentence thesis for a trader skimming the terminal"),
  business: z.object({
    overview: z.string().describe("Two or three sentences: what the company sells, to whom, and how it makes money"),
    segments: z
      .array(
        z.object({
          name: z.string(),
          share: z.number().min(0).max(1).describe("Fraction of trailing revenue, 0 to 1"),
        }),
      )
      .describe("Revenue mix, largest first. Empty for pre-revenue companies"),
    moatRating: z.enum(["wide", "narrow", "none"]),
    moatHeadline: z.string(),
    advantages: z.array(
      z.object({
        title: z.string().describe("Short name of the advantage"),
        detail: z.string().describe("Why it is durable, in one or two sentences"),
      }),
    ),
  }),
  catalysts: z.object({
    headline: z.string(),
    events: z.array(
      z.object({
        date: z.string().describe("Expected date as YYYY-MM-DD; for an approximate window, its midpoint"),
        dateLabel: z
          .string()
          .nullable()
          .describe("Display label for approximate timing such as 'Q4 2026'; null when the date is exact"),
        title: z.string(),
        type: z.enum(["earnings", "clinical", "product", "regulatory", "corporate", "macro"]),
        impact: Level.describe("Expected impact on the share price"),
        detail: z.string(),
      }),
    ),
  }),
  risks: z.object({
    headline: z.string(),
    factors: z.array(
      z.object({
        title: z.string(),
        severity: Level,
        source: z.string().describe("Where the risk is disclosed, e.g. '10-K FY2025 · Item 1A'"),
        summary: z.string().describe("Plain-English paraphrase of the disclosed risk"),
      }),
    ),
  }),
  sources: z.array(z.string()).describe("Filings and documents the analysis draws on"),
});

export const AIReportEnvelopeSchema = z.object({
  report: AIReportSchema,
  meta: z.object({
    provider: z.enum(["mock", "anthropic"]),
    model: z.string(),
    generatedAt: z.string(),
    latencyMs: z.number(),
  }),
});

export type AIReport = z.infer<typeof AIReportSchema>;
export type AIReportEnvelope = z.infer<typeof AIReportEnvelopeSchema>;
export type Catalyst = AIReport["catalysts"]["events"][number];
export type RiskFactor = AIReport["risks"]["factors"][number];
export type Level = z.infer<typeof Level>;
