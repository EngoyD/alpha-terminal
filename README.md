# Alpha Terminal v2

A single-screen research terminal prototype: watchlist, AI discovery, a simulated live quote feed, price chart, an AI-generated fundamental thesis, SEC-style financial health stats, and news with sentiment. Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Recharts and lucide-react.

All market data is mock data. Nothing here is investment advice.

Live demo: https://engoyd.github.io/alpha-terminal/

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Checks:

```bash
npm run lint && npm run typecheck && npm test
```

## Layout

- **Header:** index strip (S&P 500, Nasdaq, Dow, VIX, 10Y, Russell 2000, BTC, DXY, crude, gold), NYSE/LSE/TSE session status and a New York clock.
- **Sidebar:** ticker search (adds to the watchlist), watchlist with intraday sparklines, and AI Discovery (catalyst, volatility and value signals, with rescan).
- **Main stage:** hero metrics, price chart (1D to 1Y with a volume pane), the AI panel (Core Business & Moat, Catalysts & Earnings, Risk Factors), Financial Health with SEC flags, and News & Filings with sentiment.

At 1280px and wider everything fits in one viewport and panels scroll internally. Narrower screens scroll, and below 1024px the sidebar becomes a drawer.

## Keyboard

| Key | Action |
| --- | --- |
| `/` | Focus ticker search |
| `↑` `↓` | Move through the watchlist |
| `G` | Generate (or regenerate) the AI report |
| `1` `2` `3` | Switch AI report section |
| `W` | Add or remove the current ticker from the watchlist |
| `Esc` | Clear search / close the drawer |

## Code map

```
src/
  app/
    page.tsx                      renders <TerminalApp /> (client-only, boot screen while loading)
    api/ai-report/route.api.ts    GET: active provider/model. POST { ticker }: AIReportEnvelope
  components/terminal/
    TerminalProvider.tsx          global state: selection, watchlist, reports, feed, discovery
    AlphaTerminal.tsx             shell, hotkeys, mobile drawer
    MarketHeader.tsx, StatusBar.tsx
    sidebar/                      TickerSearch, Watchlist, AIDiscovery
    stage/                        TickerHero, PriceChart, FinancialHealth, NewsFeed, ai/*
  lib/
    data/companies.ts             11 mock companies: profile, quote seed, fundamentals, news, discovery thesis
    market/                       seeded 1Y + intraday series, tick simulator, exchange sessions, tape alerts
    ai/schema.ts                  AIReport zod schema: types, validation and JSON Schema in one place
    ai/config.ts                  provider, model and report-API settings
    ai/fixtures.ts, ai/mock.ts    canned reports and the mock provider
    ai/server/                    Claude provider, shared report cache, rate limiter (server only)
```

## AI integration

The UI only consumes `AIReportEnvelope` from `POST /api/ai-report`. `src/lib/ai/schema.ts` is the contract. The route validates every report against it, mock fixtures included, and the client validates the response again before rendering.

Providers, selected with `AI_PROVIDER` (see `.env.example`):

- `mock` (default): canned reports from `src/lib/ai/fixtures.ts` with about a second of simulated latency.
- `anthropic`: set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY`. Calls `claude-opus-5` with structured outputs, so the response has to match the schema, and opts into server-side fallbacks so a declined request is retried on another model. The prompt includes the ticker's snapshot from the mock data. Without a key the app falls back to mock reports and logs a warning.

Live reports cost money, so the route protects them:

- Each ticker's report is generated at most once every 12 hours and shared by every visitor through the Next.js data cache (the Vercel Data Cache in production). The UI marks these reports as cached and disables Regenerate until the window ends.
- Simultaneous requests for the same ticker share one model call.
- Each client IP gets 20 requests per 10 minutes. This limit lives in memory per server instance, so it is best-effort; use a shared store such as Redis for a hard global limit.

To add Gemini or another model, write a function that returns an `AIReport`, branch to it in `src/lib/ai/server/generate.ts`, and run the result through `AIReportSchema.parse` before returning it. `z.toJSONSchema(AIReportSchema)` produces the JSON Schema to hand to the provider's structured-output option.

## Deploy

### Vercel (full app, live Claude reports)

Import the repo in Vercel (or run `vercel --prod`) and set these environment variables for Production:

| Variable | Value |
| --- | --- |
| `AI_PROVIDER` | `anthropic` |
| `ANTHROPIC_API_KEY` | your Anthropic API key |
| `REPORT_ALLOWED_ORIGINS` | `https://engoyd.github.io` (lets the Pages build call the API) |

The report route sets `maxDuration = 300`, which covers a live model call.

### GitHub Pages (static)

`.github/workflows/pages.yml` runs lint, typecheck and tests, then deploys every push to `main`. It runs `npm run build:static`, which exports a static site to `out/` with the Pages base path (`/alpha-terminal`).

GitHub Pages has no server, so the static build leaves out the API route: route handlers that need a server are named `route.api.ts`, and `next.config.ts` only includes that extension in server builds. If the repository variable `REPORT_API_URL` is set (for example `https://<your-vercel-domain>/api/ai-report`), the Pages build requests reports from that API. Otherwise, or if the API can't be reached, the browser runs the mock provider.

## Mock data notes

- Coverage: NVDA, AAPL, MSFT, TSLA, AMD, PLTR, SLS, VKTX, CRSP, RKLB, IONQ. Search only adds covered tickers.
- Price history is a seeded Brownian bridge anchored to the Sep 25, 2026 session, so charts are identical on every load. The live feed exaggerates tick size so movement is visible, and it runs even when the real market is closed.
- Headlines, filings, catalysts and risk text are illustrative, not taken from real filings.
- The watchlist and selected ticker persist in `localStorage`.
