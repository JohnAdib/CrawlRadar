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

How the requirements map to the code, and where the implementation goes further or deliberately differs.

| Requirement    | Where                                                                                                     | Notes                                                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1.1 to 1.4  | [`apps/web/public/t.js`](../apps/web/public/t.js), [`/api/collect`](../apps/web/app/api/collect/route.ts) | About 400 bytes, `async`. Served from the dashboard's own domain, so the install is one line.                                                                                         |
| FR-1.2, FR-2.x | [`supabase/functions/_shared/bots.ts`](../supabase/functions/_shared/bots.ts)                             | The user agent is read from the request header on the server, never from page script. The list is extended with Claude-User, Claude-SearchBot, Perplexity-User, Amazonbot and others. |
| FR-1.3         | [`supabase/functions/track`](../supabase/functions/track/index.ts)                                        | IPs are stored as a SHA-256 hash with a salt that rotates daily.                                                                                                                      |
| FR-3.x         | [`crawler_stats()`](../supabase/migrations), [`components/dashboard`](../apps/web/components/dashboard)   | One SQL function returns every chart's data in one round trip, under RLS.                                                                                                             |
| FR-4.1         | [`/export`](../apps/web/app/(app)/export/route.ts)                                                        | Pages through all rows (past the 1,000-row API limit) and escapes spreadsheet formulas.                                                                                               |
| AC-1 to AC-6   | [`e2e/`](../e2e), unit tests                                                                              | Covered by the Playwright suite and unit tests.                                                                                                                                       |

**Deliberate differences**

- **The beacon is a GET image request, not a POST.** It needs no CORS preflight and works the same for the `<noscript>` pixel.
- **AI referrals were added.** People arriving from ChatGPT, Perplexity, Claude, Gemini or Copilot are tracked as a fifth bot type, `referral`, because they matter as much as crawlers.
- **The schema was hardened:**
  - `timestamptz` instead of `timestamp`
  - `not null` and check constraints
  - cascading deletes
  - a `referrer` column
  - insert and delete RLS policies (the initial design only had select policies, so users couldn't add sites)
- **`Google-Extended` and `Applebot-Extended` are robots.txt tokens.** Google and Apple crawl with their normal user agents, so these two rarely appear in real traffic. They are still matched (AC-1).
