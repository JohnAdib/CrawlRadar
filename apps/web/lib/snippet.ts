// The tags a site owner pastes into their pages. Pure, so client components can use it.

/** The one tag a site owner pastes into their <head>. */
export function snippet(origin: string, siteId: string): string {
  return `<script async src="${origin}/t.js?s=${siteId}"></script>`
}

/**
 * Optional no-JavaScript fallback: a 1x1 image inside <noscript>. Without a script the page
 * URL comes from the Referer header, so the image asks the browser to send it in full.
 */
export function pixel(origin: string, siteId: string): string {
  return `<noscript><img src="${origin}/api/collect?t=img&sid=${siteId}" alt="" width="1" height="1" referrerpolicy="no-referrer-when-downgrade"></noscript>`
}
