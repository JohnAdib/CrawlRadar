<div align="center">

# CrawlRadar

**Open-source analytics for the AI web.**
See which AI crawlers (GPTBot, ClaudeBot, PerplexityBot and more) read your site, what they read, and how many people AI assistants send back to you.

[![CI](https://github.com/JohnAdib/CrawlRadar/actions/workflows/ci.yml/badge.svg)](https://github.com/JohnAdib/CrawlRadar/actions/workflows/ci.yml)
[![Coverage: 100%](https://img.shields.io/badge/coverage-100%25-brightgreen)](#testing)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%C2%B7%20Auth%20%C2%B7%20Edge-3ecf8e)

**[Try the live demo](https://crawlradar.vercel.app/#demo)** · [Quick start](#quick-start) · [Deploy](#deploy) · [Requirements](docs/PRD.md)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/dashboard-dark.png">
  <img alt="CrawlRadar dashboard: AI crawler visits, AI referrals, AI traffic by type, platforms and referral sources" src="docs/images/dashboard-light.png">
</picture>

</div>

## Why

Regular analytics tools filter bots out. But AI platforms now read the web around the clock: to train models, to power AI search, and to answer questions in real time. CrawlRadar does the opposite of normal analytics. It shows you exactly that traffic, so you know how visible you are to AI, and which assistants send real people your way.

## Features

- **One-line install.** A single async `<script>` tag served from your own CrawlRadar domain. The tracker is about 400 bytes.
- **Every AI crawler, classified.** Known bots are grouped by platform (OpenAI, Anthropic, Google, Perplexity, Meta, Apple, Amazon...) and by purpose: training, search or assistant. Unknown self-declared bots are flagged as `Unknown`.
- **AI referrals.** Count the people who click through from ChatGPT, Perplexity, Claude, Gemini and Copilot.
- **A dashboard worth opening:**
  - crawler visits and referrals with change versus the previous period
  - AI traffic stacked by type
  - visits by platform
  - referral sources
  - top pages
  - a weekday × hour heatmap
  - a crawler table with last-seen times
  - a recent activity feed
- **Filters and export.** 24h / 7d / 30d ranges, platform and bot-type filters kept in the URL, and CSV export of the current view or a site's full history.
- **Polished details.** Animated empty states that guide installation and update live when the first hit lands, loading skeletons, light and dark mode, and a layout built for phones.
- **Private and multi-tenant.** Supabase Auth plus Postgres row-level security, so users only ever see their own data. IPs are stored as a daily-salted hash, never raw.

## How it works

```mermaid
flowchart LR
  S["Your website<br/>&lt;script src=/t.js&gt;"] -- "GET /api/collect" --> C["Next.js<br/>/api/collect"]
  C -- "forwards UA + IP" --> F["Supabase Edge Function<br/>track"]
  F -- "classify, insert" --> DB[("Supabase Postgres")]
  D["Next.js dashboard"] -- "supabase-js + RLS<br/>crawler_stats()" --> DB
```

1. **Collect.** Your site loads `/t.js` from your CrawlRadar domain. It sends the page URL and referrer to `/api/collect` on the same domain, so customers never see a backend URL.
2. **Classify.** `/api/collect` forwards the visit, with the visitor's real User-Agent and IP, to the `track` Edge Function. The function classifies it from the request header (page script can't fake it) and stores only AI crawler hits and AI referrals. Ordinary human visits are dropped.
3. **Report.** The dashboard reads Postgres directly through supabase-js. RLS scopes every query to the signed-in user, and one `crawler_stats()` SQL function returns every chart's data in a single round trip. There's no separate API server.

## Quick start

**You need:** [Node.js 24+](https://nodejs.org) and pnpm. If you don't have pnpm, run `corepack enable` once.

The dashboard is plain Node.js. The only other piece is a Supabase backend. Choose one:

| | Option A: Supabase Cloud | Option B: fully local |
| --- | --- | --- |
| Needs | A free [supabase.com](https://supabase.com) account | [Docker](https://www.docker.com/) |
| Demo data | No (send test hits instead) | Yes, 30 days preloaded |
| Best for | Trying it fast, or deploying | Offline development, running tests |

First, get the code:

```bash
git clone https://github.com/JohnAdib/CrawlRadar.git
cd CrawlRadar
pnpm install
```

### Option A: Supabase Cloud (no Docker)

1. Create a free project at [supabase.com/dashboard/new](https://supabase.com/dashboard/new).

2. Log in and link the project:

   ```bash
   pnpm exec supabase login
   pnpm exec supabase link --project-ref <your-project-ref>
   ```

3. Create the tables and deploy the tracking function:

   ```bash
   pnpm exec supabase db push
   pnpm exec supabase functions deploy track --no-verify-jwt
   ```

4. Copy the env file:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

   Then set the project URL and the publishable key in `apps/web/.env.local`, from **Project Settings > API**.

5. Start the dashboard:

   ```bash
   pnpm dev
   ```

6. Open http://localhost:3000, create an account and add a site. Then send test crawler hits:

   ```bash
   pnpm simulate <site-id> 40 https://<your-project-ref>.supabase.co/functions/v1/track
   ```

### Option B: fully local (Docker)

1. Start the local Supabase stack. It runs Postgres, Auth, the tracking function and Studio, and loads the demo data.

   ```bash
   pnpm db:start
   ```

2. Copy the env file. The local values are already filled in.

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

3. Start the dashboard:

   ```bash
   pnpm dev
   ```

4. Open http://localhost:3000 and sign in as **`demo@crawlradar.dev`** / **`crawlradar-demo`**.

Local URLs:

| URL | What |
| --- | --- |
| http://localhost:3000 | Home page and dashboard |
| http://127.0.0.1:54323 | Supabase Studio (browse tables) |
| http://127.0.0.1:54321/functions/v1/track | Tracking function |

## Install the tracker on your site

On **Sites**, click **Add website**, then paste the one tag it gives you into the `<head>` of every page:

```html
<script async src="https://<your-crawlradar>/t.js?s=<site-id>"></script>
```

<img alt="Sites page with the one-line snippet" src="docs/images/install.png" width="800">

The site shows **"Last hit ..."** as soon as the first event lands. The dashboard listens with a live empty state, then switches to charts on its own.

<details>
<summary>Optional: count crawlers that don't run JavaScript</summary>

Most AI crawlers fetch HTML without running scripts. If you can add a second tag, put this right after `<body>`:

```html
<noscript><img src="https://<your-crawlradar>/api/collect?sid=<site-id>&t=img" alt="" width="1" height="1" style="position:absolute;left:-9999px"></noscript>
```

Browsers send only your domain as the referrer for this image, so these hits may be recorded without a page path. Server-side tracking, which sees every request, is on the roadmap.

</details>

## Testing

| Suite | Command | What it covers |
| --- | --- | --- |
| Unit (Vitest) | `pnpm test` | Bot and referrer classifier, stats engine, CSV writer, filters, demo data, collect endpoint, Supabase client wiring |
| Coverage | `pnpm test:coverage` | 100% of statements, branches, functions and lines in that code. CI fails below 100% |
| End-to-end (Playwright) | `pnpm test:e2e` | Home page demo, sign in/out, dashboard filters and CSV export, the full install journey (sign up, add site, snippet, live hits) and phone layouts |

End-to-end tests run against a production build and the local Supabase stack. Run `pnpm db:start` first.

## Deploy

### 1. Supabase

1. Do steps 1 to 3 of [Option A](#option-a-supabase-cloud-no-docker). The demo seed is never pushed to a hosted project.
2. Optionally, set your own salt for IP hashing. Without one, the function falls back to the service role key.

   ```bash
   pnpm exec supabase secrets set IP_HASH_SALT="$(openssl rand -hex 32)"
   ```

3. In **Authentication > URL Configuration**, set the Site URL to your dashboard's URL.

### 2. Dashboard (Vercel or any Node host)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJohnAdib%2FCrawlRadar&root-directory=apps%2Fweb&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

Set **Root Directory** to `apps/web` and add two environment variables from **Project Settings > API**:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the publishable key |

The service-role key lives only inside the Edge Function. The dashboard never needs it.

## Project structure

```
apps/web/                  Next.js 16 app (App Router, Server Components, Server Actions)
  app/page.tsx             home page with the interactive demo dashboard
  app/(app)/               signed-in pages: /dashboard, /sites, /export (CSV)
  app/api/collect/         public collection endpoint, forwards to the track function
  components/dashboard/    dashboard view, shared by the live app and the demo
  lib/stats.ts             stats engine (TypeScript twin of crawler_stats(), used by the demo)
  public/t.js              the tracker customers embed
packages/ui/               @crawlradar/ui: shadcn/ui design system
supabase/
  migrations/              schema, RLS policies, crawler_stats()
  functions/track/         tracking function (Deno)
  functions/_shared/       bot and referrer classifier
  seed.sql                 local demo user and 30 days of data
e2e/                       Playwright tests
scripts/simulate-bots.ts   send test crawler hits
docs/PRD.md                product requirements and implementation notes
```

## Adding a bot

Add one line to `BOT_PATTERNS` in [`supabase/functions/_shared/bots.ts`](supabase/functions/_shared/bots.ts), add a case in `bots.test.ts`, and run `pnpm test`. [Known Agents](https://knownagents.com/agents) keeps a good list of new agents. Pull requests are welcome.

## Design decisions

| Decision | Why | Considered instead |
| --- | --- | --- |
| One `<script src>` tag on your own domain | Shortest install, a cacheable static tracker, and customers only see your domain | Inline loader pointing at `*.supabase.co` (longer, exposes the backend) |
| `/api/collect` forwards to the Edge Function | Ingest logic lives in one place, and the web host needs no service-role key | Inserting from a Next.js route (secret key in the web host) |
| User-Agent read on the server, beacon via a GET pixel | No CORS preflight, and page script can't fake the UA | `fetch`/`sendBeacon` POST with a JS-reported UA |
| Only AI hits and referrals are stored | Keeps the free tier small and avoids storing personal browsing data | Store everything and filter at query time |
| Daily-salted SHA-256 IP hash | Groups visits within a day without storing an IP or tracking across days | Raw IP; a static hash (reversible by brute force over IPv4) |
| No custom API: supabase-js, RLS and one SQL function | Less code to run and secure; authorisation enforced in the database | A separate API server; client-side aggregation (breaks past 1,000 rows) |
| Stats engine mirrored in TypeScript | The home page demo runs the real dashboard on mock data, fully client-side, and the logic is unit-testable | A static screenshot |
| Monorepo with a shared `@crawlradar/ui` | shadcn's official monorepo layout; room for `apps/api` or docs later | A single app |

## Limitations

- **JavaScript tracking only sees crawlers that load your page's resources.** Bots that read raw HTML without loading `<script>` or `<img>` are invisible. Server-side tracking (edge middleware or log import) is the planned fix.
- **`Google-Extended` and `Applebot-Extended` are robots.txt tokens.** Google and Apple crawl with their normal user agents, so these two rarely appear in real traffic.
- **Site IDs are public.** Someone who copies a snippet could send fake events. Origin checks and rate limiting are on the roadmap.
- **Volume.** Fine for small and medium sites on Supabase's free tier. Large sites should add partitioning or a daily rollup table.

## Roadmap

- [ ] Server-side tracking (middleware and log import)
- [ ] Origin verification and rate limiting on collection
- [ ] Daily rollup table for large sites
- [ ] robots.txt checker: which AI bots you allow or block
- [ ] Email digests and alerts

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © MrAdib
