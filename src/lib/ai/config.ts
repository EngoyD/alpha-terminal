/**
 * Set at build time for static hosting (GitHub Pages). That build has no API route:
 * reports come from NEXT_PUBLIC_REPORT_API when it is set, otherwise the browser
 * runs the mock provider itself.
 */
export const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

/** Report endpoint, or null when the browser should run the mock provider. */
export const REPORT_API: string | null =
  process.env.NEXT_PUBLIC_REPORT_API || (STATIC_EXPORT ? null : "/api/ai-report");

export const MOCK_MODEL = "alpha-mock-v2";
export const CLAUDE_MODEL = "claude-opus-5";

/** Live reports are cached per ticker for this long and shared by every visitor. */
export const LIVE_REPORT_TTL_HOURS = 12;
