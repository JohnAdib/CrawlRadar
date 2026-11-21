// Onboarding's "is the snippet on my site?" check. The server fetches the site's home page,
// so only public hostnames are allowed (no localhost, private names or raw IP addresses).

const PRIVATE_NAME = /(^|\.)(localhost|local|internal|intranet|lan|home|corp)$/i
const IP_LITERAL = /^(\d{1,3}(\.\d{1,3}){3}|\[?[0-9a-f:]+\]?)$/i

/** True for a public DNS name like example.com, false for anything internal. */
export function isPublicHost(host: string): boolean {
  const name = host.toLowerCase().replace(/\.$/, "")
  return (
    name.includes(".") && !PRIVATE_NAME.test(name) && !IP_LITERAL.test(name)
  )
}

/** True when the page's HTML loads CrawlRadar for this site (script or pixel). */
export function pageHasSnippet(html: string, siteId: string): boolean {
  const id = siteId.toLowerCase()
  const text = html.toLowerCase()
  return text.includes(`t.js?s=${id}`) || text.includes(`sid=${id}`)
}
