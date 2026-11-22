// The tags a site owner pastes into their pages. Pure, so client components can use it.

/** The JavaScript tag: reads the page URL and referrer itself and sends them. */
export function snippet(origin: string, siteId: string): string {
  return `<script async src="${origin}/t.js?s=${siteId}"></script>`
}

const IMG_ATTRS = `alt="" width="1" height="1" style="position:absolute"`

/**
 * The plain pixel: the same tag on every page, so the page URL comes from the browser's
 * Referer header (the image asks for it in full).
 */
export function pixel(origin: string, siteId: string): string {
  return `<img src="${origin}/api/collect?t=img&sid=${siteId}" ${IMG_ATTRS} referrerpolicy="no-referrer-when-downgrade">`
}

/**
 * Hybrid: the script, plus the pixel for visitors that don't run JavaScript. Browsers that
 * run the script never load <noscript> content, so no visit is counted twice.
 */
export function hybrid(origin: string, siteId: string): string {
  return `${snippet(origin, siteId)}
<noscript>${pixel(origin, siteId)}</noscript>`
}
