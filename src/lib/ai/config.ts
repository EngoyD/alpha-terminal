/**
 * Set at build time for static hosting (GitHub Pages). There is no API route in
 * that build, so the browser runs the mock report provider itself.
 */
export const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export const MOCK_MODEL = "alpha-mock-v2";
