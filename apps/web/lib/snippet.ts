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

export type PixelTemplate = "wordpress" | "shopify" | "any"

// How each platform writes the current page's full URL, URL-encoded, into the page.
const PAGE_URL: Record<PixelTemplate, string> = {
  wordpress: `<?php echo rawurlencode((is_ssl() ? "https://" : "http://") . $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"]); ?>`,
  shopify: "{{ canonical_url | url_encode }}",
  any: "PAGE_URL",
}

/**
 * The pixel with the page's own URL in the image link (`u=`), written in by the site's
 * template. No Referer needed, so the page is always exact, query string (UTM tags) included.
 */
export function pixelWithPage(
  origin: string,
  siteId: string,
  template: PixelTemplate
): string {
  return `<img src="${origin}/api/collect?t=img&sid=${siteId}&u=${PAGE_URL[template]}" ${IMG_ATTRS}>`
}
