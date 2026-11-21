// Sends realistic AI-crawler hits to the track endpoint so you can see data immediately.
//
//   pnpm simulate <site-id> <domain> [count] [track-url]
//
// <domain> must be the site's domain: the track function only counts hits from it.
//
// Defaults to the local Supabase stack. Runs on Node 24+ (native TypeScript), no dependencies.

const [
  siteId,
  domain,
  countArg = "40",
  trackUrl = "http://127.0.0.1:54321/functions/v1/track",
] = process.argv.slice(2)

if (!siteId || !domain) {
  console.error(
    "Usage: pnpm simulate <site-id> <domain> [count] [track-url]\nFind the site ID on the site's page under Sites."
  )
  process.exit(1)
}

const BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0 Safari/537.36"

// [user agent, referrer]. The four PRD acceptance-criteria bots come first.
const VISITORS: [string, string?][] = [
  [
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot",
  ],
  [
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
  ],
  [
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
  ],
  ["Mozilla/5.0 (compatible; Google-Extended)"],
  [
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
  ],
  [
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
  ],
  [
    "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)",
  ],
  ["CCBot/2.0 (https://commoncrawl.org/faq/)"],
  [BROWSER, "https://chatgpt.com/"],
  [BROWSER, "https://www.perplexity.ai/"],
  [BROWSER, "https://www.google.com/"], // ordinary human visit: ignored, not stored
]
const PAGES = [
  "/",
  "/pricing",
  "/blog/ai-search-guide",
  "/docs/getting-started",
  "/about",
]

const count = Number(countArg)
let sent = 0
for (let i = 0; i < count; i++) {
  const [userAgent, referrer = ""] = VISITORS[i % VISITORS.length]!
  const page = `https://${domain}${PAGES[i % PAGES.length]}`
  const url = `${trackUrl}?sid=${siteId}&u=${encodeURIComponent(page)}&r=${encodeURIComponent(referrer)}`
  const res = await fetch(url, { headers: { "user-agent": userAgent } })
  if (res.ok) sent++
  else console.error(`HTTP ${res.status} for ${userAgent.slice(0, 40)}`)
}
console.log(
  `Sent ${sent}/${count} hits to ${trackUrl}. Open the dashboard to see them.`
)
