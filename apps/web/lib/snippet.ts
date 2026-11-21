import { SUPABASE_URL } from "@/lib/supabase/server"

export function trackUrl(): string {
  return `${SUPABASE_URL}/functions/v1/track`
}

/** Paste into <head>. Sends the page URL and referrer; the User-Agent is read server-side. */
export function headSnippet(siteId: string): string {
  return `<!-- CrawlRadar -->
<script>
(function(d,s){var g=d.createElement("script");g.async=1;
g.src="${trackUrl()}?sid="+s+"&u="+encodeURIComponent(location.href)+"&r="+encodeURIComponent(d.referrer);
d.head.appendChild(g)})(document,"${siteId}");
</script>`
}

/** Paste right after <body>. Counts crawlers that don't run JavaScript. */
export function bodySnippet(siteId: string): string {
  return `<noscript><img src="${trackUrl()}?sid=${siteId}&t=img" alt="" width="1" height="1" style="position:absolute;left:-9999px"></noscript>`
}
