# CrawlRadar: product requirements

The original requirements CrawlRadar was built from, with notes on how each one is implemented and where the implementation deliberately differs.

## 1. Summary

An AI crawler analytics tool that monitors and tracks AI bot activity on websites. Site owners can see which AI platforms (ChatGPT, Claude, Perplexity, Gemini and others) are crawling their content, which pages they visit, and how often.

**Stack:** Supabase (Postgres, Auth, Edge Functions) and a Next.js / React frontend.

## 2. Problem

Traditional analytics tools don't capture AI crawler activity. Site owners need visibility into how AI platforms interact with their content, so they can optimise for AI discoverability and make informed decisions about bot access.

## 3. Goals

- Visibility into AI crawler activity on a user's websites
- Identify and categorise known AI bots by platform
- Track which pages AI crawlers visit most
- CSV export for reporting

## 4. User stories

| ID   | As a...               | I want to...                            | So that...                          |
| ---- | --------------------- | --------------------------------------- | ----------------------------------- |
| US-1 | Website owner         | see which AI platforms crawl my site    | I understand my AI visibility       |
| US-2 | SEO professional      | know which pages AI crawlers visit most | I can optimise high-value content   |
| US-3 | Content strategist    | track crawler activity over time        | I can identify trends               |
| US-4 | Website administrator | install a tracking snippet easily       | I can start collecting data quickly |
| US-5 | Marketing manager     | export crawler data as CSV              | I can use it in reports             |

## 5. Functional requirements

### 5.1 Tracking snippet

| ID     | Requirement                                                                   |
| ------ | ----------------------------------------------------------------------------- |
| FR-1.1 | Lightweight JavaScript snippet (under 5 KB) that users embed on their website |
| FR-1.2 | Capture user agent strings and identify known AI crawler signatures           |
| FR-1.3 | Record page URL, timestamp and anonymised IP for each crawler visit           |
| FR-1.4 | Load asynchronously to minimise page performance impact                       |

### 5.2 Bot detection and classification

| ID     | Requirement                                                                      |
| ------ | -------------------------------------------------------------------------------- |
| FR-2.1 | Maintain a list of known AI crawler user agent patterns                          |
| FR-2.2 | Classify crawlers by platform: OpenAI, Anthropic, Google, Perplexity, Meta, etc. |
| FR-2.3 | Categorise bot types: AI Training, AI Search, AI Assistant                       |
| FR-2.4 | Flag unknown bots as "Unknown"                                                   |

### 5.3 Analytics dashboard

| ID     | Requirement                                                   |
| ------ | ------------------------------------------------------------- |
| FR-3.1 | Display total crawler visits over time periods (24h, 7d, 30d) |
| FR-3.2 | Show a breakdown of visits by AI platform, with charts        |
| FR-3.3 | List top pages visited by crawlers, with visit counts         |
| FR-3.4 | Display a crawler activity timeline / trend chart             |
| FR-3.5 | Filter by bot type, platform and date range                   |
| FR-3.6 | Show a recent crawler activity log                            |

### 5.4 Data export

| ID     | Requirement                                |
| ------ | ------------------------------------------ |
| FR-4.1 | Export crawler data as CSV with all fields |

## 6. Technical architecture

### 6.1 Components

| Component              | Responsibility                                                   |
| ---------------------- | ---------------------------------------------------------------- |
| Tracking snippet       | Captures the page URL, referrer and timestamp and sends a beacon |
| Supabase Edge Function | Receives the beacon, classifies the bot, inserts into Postgres   |
| Supabase Postgres      | Stores crawler events and site configuration                     |
| Supabase Auth          | User authentication                                              |
| Next.js dashboard      | Analytics, charts and CSV export                                 |

### 6.2 Known AI crawler user agents (initial list)

| Platform     | User agent           | Purpose                        |
| ------------ | -------------------- | ------------------------------ |
| OpenAI       | `GPTBot`             | AI training                    |
| OpenAI       | `ChatGPT-User`       | Real-time browsing (assistant) |
| OpenAI       | `OAI-SearchBot`      | AI search                      |
| Anthropic    | `ClaudeBot`          | AI training                    |
| Google       | `Google-Extended`    | Gemini training                |
| Perplexity   | `PerplexityBot`      | AI search                      |
| Meta         | `Meta-ExternalAgent` | AI training                    |
| Apple        | `Applebot-Extended`  | AI features                    |
| Common Crawl | `CCBot`              | Dataset building               |
| Bytedance    | `Bytespider`         | AI training                    |

### 6.3 Data model

- `sites`: id, owner (`auth.users`), domain, created_at
- `crawler_events`: id, site_id, timestamp, user_agent, bot_name, platform, bot_type, page_url, page_path, ip_hash
- Indexes on `(site_id, timestamp desc)` and `(platform)`
- Row-level security so users only read their own sites and events

## 7. UI / UX

**Views:** Overview (totals and key metrics), Platforms (chart by platform), Pages (pages ranked by visits), Activity log (recent events, filterable), Settings (tracking snippet and CSV export).

**Installation flow:**

1. User signs up
2. User adds a website domain
3. The system generates tracking code containing the site ID
4. User pastes the code into their site's `<head>`
5. Data appears on the dashboard

## 8. Acceptance criteria

| ID   | Criterion                                                             |
| ---- | --------------------------------------------------------------------- |
| AC-1 | Tracking detects GPTBot, ClaudeBot, PerplexityBot and Google-Extended |
| AC-2 | Dashboard shows crawler visits grouped by platform                    |
| AC-3 | Top pages report ranks pages by crawler visit count                   |
| AC-4 | Date range filtering works on the dashboard                           |
| AC-5 | CSV export downloads all crawler data                                 |
| AC-6 | A user can install the tracking code in under 5 minutes               |

## 9. Out of scope (v1)

REST API endpoints, webhook notifications, real-time alerts, bot blocking, server log analysis, team / multi-user features, custom date ranges beyond the presets.

## 10. Risks

| Risk                               | Mitigation                                          |
| ---------------------------------- | --------------------------------------------------- |
| AI bots may not execute JavaScript | Document the limitation; server-side tracking is v2 |
| Bot signatures change              | Regex patterns that match partial strings           |
| High-volume sites                  | Free-tier limits documented, with an upgrade path   |

## 11. CSV format

```
timestamp,page_url,bot_name,platform,bot_type,user_agent
2026-01-31T10:23:45Z,/blog/post-1,GPTBot,OpenAI,training,"Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko)..."
2026-01-31T10:24:12Z,/docs/api,ClaudeBot,Anthropic,training,"ClaudeBot/1.0..."
```

---

## Implementation notes

Every requirement above, where it lives in the code, and how it is tested.
Tests: **unit** = Vitest (100% coverage of the logic), **e2e** = Playwright, **db** = pgTAP.

### User stories

| ID   | How CrawlRadar answers it                                                                                                                                                                                                                     | Tested                                           |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| US-1 | **Platforms** view: share donut, traffic per platform over time, a row per platform with its crawlers. Brand logos for 40+ platforms, including DeepSeek, Alibaba (Qwen), Moonshot AI (Kimi), Baidu, Tencent, Zhipu AI and Bytedance (Doubao) | e2e `tracking`, `dashboard`                      |
| US-2 | **Pages** view: every crawled page ranked by visits, with AI crawls, referrals, crawlers, top platform, last crawl and a search box. Any page opens its own report                                                                            | e2e `dashboard`, `tracking`; unit `computePages` |
| US-3 | **Overview**: totals for 24h / 7d / 30d with change against the previous period, traffic over time by platform or by type, a weekday-by-hour heatmap                                                                                          | unit `computeStats`; e2e `dashboard`             |
| US-4 | **Onboarding**: five locked steps (account, website, install, verify, explore) with a progress tracker, install tips per platform and an automatic "it works" check                                                                           | e2e `onboarding`                                 |
| US-5 | **Export**: CSV of every field, for the current view or all data, from every view and from Settings                                                                                                                                           | e2e `dashboard`; unit `csv`                      |

### Functional requirements

| ID     | Where                                                                     | Notes                                                                                                                                                                                |
| ------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-1.1 | [`public/t.js`](../apps/web/public/t.js)                                  | About 400 bytes (limit 5 KB)                                                                                                                                                         |
| FR-1.2 | [`_shared/bots.ts`](../supabase/functions/_shared/bots.ts)                | The user agent is read from the request header on the server, never from page script                                                                                                 |
| FR-1.3 | [`track/index.ts`](../supabase/functions/track/index.ts)                  | Page URL, path, timestamp and a SHA-256 IP hash with a salt that rotates daily                                                                                                       |
| FR-1.4 | [`lib/snippet.ts`](../apps/web/lib/snippet.ts)                            | `<script async>`; the beacon is an image request, so it never blocks the page                                                                                                        |
| FR-2.1 | [`_shared/ai-bots.ts`](../supabase/functions/_shared/ai-bots.ts)          | 60+ AI crawlers, cross-checked with the community [ai.robots.txt](https://github.com/ai-robots-txt/ai.robots.txt) list. Case-insensitive substring matching survives version changes |
| FR-2.2 | same                                                                      | Platform per bot (the company); assistants are named separately for referrals                                                                                                        |
| FR-2.3 | [`bot-types.ts`](../supabase/functions/_shared/bot-types.ts)              | Training, search, assistant, plus referral and search engine                                                                                                                         |
| FR-2.4 | [`bots.ts`](../supabase/functions/_shared/bots.ts)                        | Any other bot, detected with the maintained [isbot](https://github.com/omrilotan/isbot) pattern list, is stored as platform "Unknown", named from its user agent                     |
| FR-3.1 | [`stat-row.tsx`](../apps/web/components/dashboard/stat-row.tsx)           | Fixed 24h / 7d / 30d totals on the first card, independent of the selected range                                                                                                     |
| FR-3.2 | Overview and Platforms views                                              | Bar list, donut and stacked area charts                                                                                                                                              |
| FR-3.3 | Overview (top 10) and Pages view (all)                                    |                                                                                                                                                                                      |
| FR-3.4 | [`traffic-chart.tsx`](../apps/web/components/dashboard/traffic-chart.tsx) | Hourly for 24h, daily otherwise; split by platform or by type                                                                                                                        |
| FR-3.5 | [`filters.tsx`](../apps/web/components/dashboard/filters.tsx)             | Range, platform and type, kept in the URL; also page and platform reports                                                                                                            |
| FR-3.6 | Overview (latest 10) and **Activity log** view                            | The log loads as you scroll (batches of 50), is filterable, and shows user agent and referrer                                                                                        |
| FR-4.1 | [`/export`](<../apps/web/app/(app)/export/route.ts>)                      | Written with [PapaParse](https://www.papaparse.com/); pages past the 1,000-row API limit; neutralises spreadsheet formulas                                                           |

### Views (7.1) and install flow (7.2)

| View                                 | Route                  |
| ------------------------------------ | ---------------------- |
| Overview                             | `/dashboard`           |
| Platforms                            | `/dashboard/platforms` |
| Pages                                | `/dashboard/pages`     |
| Activity log                         | `/dashboard/activity`  |
| Settings (snippet, CSV export, site) | `/dashboard/settings`  |

The install flow is the onboarding at `/onboarding`: sign up, add a domain, copy the generated tag (with the site ID), paste it just before `</body>` or in the `<head>`, then the first visit to the site unlocks the dashboard. The check also looks for the tag in the site's HTML. The views appear once the first visit is recorded.

### Acceptance criteria

| ID   | Proof                                                                                               |
| ---- | --------------------------------------------------------------------------------------------------- |
| AC-1 | unit `bots.test.ts` (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and every other listed bot) |
| AC-2 | e2e `dashboard` and `tracking` (visits by platform, Platforms view)                                 |
| AC-3 | e2e `dashboard` (Pages view), unit `computePages`                                                   |
| AC-4 | e2e `dashboard` ("filters are kept in the URL")                                                     |
| AC-5 | e2e `dashboard` (CSV header and file names)                                                         |
| AC-6 | e2e `onboarding`: sign-up to working dashboard in a few clicks                                      |

### Phases

- **Phase 1:** Supabase project, schema, RLS, the `track` Edge Function, classification, the tracking snippet, end-to-end tests. All done.
- **Phase 2:** Next.js with Supabase Auth, layout, overview stats, platform chart, top pages, activity log with filters, CSV export, tests. All done.

### Risks

| Risk                        | What was done                                                                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bots may not run JavaScript | Two install methods: the JavaScript tag, or a plain pixel that also counts crawlers which fetch images but skip scripts. The README documents the rest; server-side tracking is on the roadmap |
| Signatures change           | Partial, case-insensitive matching, a list checked against ai.robots.txt, and isbot for anything new                                                                                           |
| High volume                 | Only bot and referral hits are stored; indexes on `(site_id, timestamp)`; the upgrade path is in the README                                                                                    |

### Deliberate differences

- **The beacon is a GET image request, not a POST.** The JavaScript tag (the PRD's "tracking pixel (JS SDK)") sends the visit as a 1×1 image request, and a plain `<img>` pixel sends the same request without JavaScript. Both are offered side by side, with what each one records. No CORS preflight is needed.
- **The activity log scrolls endlessly** (keyset batches of 50, loaded before you reach the end) instead of pages.
- **AI referrals were added.** People arriving from ChatGPT, Perplexity, Claude, Gemini, DeepSeek, Kimi, Qwen and others are tracked as their own type, `referral`.
- **Search engines were added.** Googlebot, Bingbot, Baiduspider, YandexBot and others are stored as `search_engine`, shown alongside, and kept out of the "AI crawler" totals.
- **The schema was hardened:** `timestamptz`, `not null` and check constraints, cascading deletes, a `referrer` column, `sites.installed_at` for onboarding, and insert, delete and column-limited update policies.
- **`Google-Extended` and `Applebot-Extended` are robots.txt tokens.** Google and Apple crawl with their normal user agents, so these two rarely appear in real traffic. They are still matched (AC-1).
