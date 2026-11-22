// Origin check: a hit only counts if the page it came from belongs to the site's domain.
// Site IDs are public (they're in the snippet), so without this anyone could copy a
// snippet onto another site and inject visits into someone else's dashboard.

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/\.$/, "")
  } catch {
    return null
  }
}

/** True when `pageUrl` is on `domain` or one of its subdomains (www., blog., ...). */
export function belongsToSite(pageUrl: string, domain: string): boolean {
  const host = hostname(pageUrl)
  if (!host) return false
  const site = domain.toLowerCase().replace(/^www\./, "")
  return host === site || host.endsWith(`.${site}`)
}

/**
 * True when a hit may count: its page is on the site and so is the Origin header, when the
 * browser sends one (beacons do; page scripts can't fake it, unlike the page URL).
 */
export function hitBelongsToSite(
  pageUrl: string,
  origin: string | null,
  domain: string
): boolean {
  if (!belongsToSite(pageUrl, domain)) return false
  return !origin || origin === "null" || belongsToSite(origin, domain)
}
