import type { NextConfig } from "next";

// `npm run build:static` targets static hosting (GitHub Pages): no server, so the
// app is exported to `out/` and the browser runs the mock AI provider itself.
const staticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  // Server-only route handlers are named `route.api.ts`, so static builds skip them.
  pageExtensions: staticExport ? ["tsx", "ts", "jsx", "js"] : ["api.ts", "tsx", "ts", "jsx", "js"],
  ...(staticExport && {
    output: "export",
    // "/alpha-terminal" for a project site; set by the Pages workflow.
    basePath: process.env.PAGES_BASE_PATH || undefined,
  }),
};

export default nextConfig;
