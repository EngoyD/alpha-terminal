# Alpha Terminal v2

A single-screen research terminal prototype: watchlist, AI discovery, a simulated live quote feed, price chart, an AI-generated fundamental thesis, SEC-style financial health stats, and news with sentiment. Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Recharts and lucide-react.

All market data is mock data. Nothing here is investment advice.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

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
    api/ai-report/route.ts        GET: active provider/model. POST { ticker }: AIReportEnvelope
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
    ai/server/                    mock fixtures, Claude provider, provider switch
```

## AI integration

The UI only consumes `AIReportEnvelope` from `POST /api/ai-report`. `src/lib/ai/schema.ts` is the contract. The route validates every report against it, mock fixtures included, and the client validates the response again before rendering.

Providers, selected with `AI_PROVIDER` (see `.env.example`):

- `mock` (default): canned reports from `src/lib/ai/server/fixtures.ts` with about a second of simulated latency.
- `anthropic`: set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` in `.env.local`. Calls `claude-opus-5` with structured outputs, so the response has to match the schema, and opts into server-side fallbacks so a declined request is retried on another model. The prompt includes the ticker's snapshot from the mock data.

To add Gemini or another model, write a function that returns an `AIReport`, branch to it in `src/lib/ai/server/generate.ts`, and run the result through `AIReportSchema.parse` before returning it. `z.toJSONSchema(AIReportSchema)` produces the JSON Schema to hand to the provider's structured-output option.

## Mock data notes

- Coverage: NVDA, AAPL, MSFT, TSLA, AMD, PLTR, SLS, VKTX, CRSP, RKLB, IONQ. Search only adds covered tickers.
- Price history is a seeded Brownian bridge anchored to the Sep 25, 2026 session, so charts are identical on every load. The live feed exaggerates tick size so movement is visible, and it runs even when the real market is closed.
- Headlines, filings, catalysts and risk text are illustrative, not taken from real filings.
- The watchlist and selected ticker persist in `localStorage`.
