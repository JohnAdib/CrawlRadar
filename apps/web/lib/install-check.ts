// Onboarding's "is the snippet on my site?" check. The server fetches the site's home page,
// so only public hostnames are allowed (no localhost, private names or raw IP addresses),
// and only when they resolve to public addresses.
import { BlockList, isIPv4 } from "node:net"

const PRIVATE_NAME = /(^|\.)(localhost|local|internal|intranet|lan|home|corp)$/i
const IP_LITERAL = /^(\d{1,3}(\.\d{1,3}){3}|\[?[0-9a-f:]+\]?)$/i

/** True for a public DNS name like example.com, false for anything internal. */
export function isPublicHost(host: string): boolean {
  const name = host.toLowerCase().replace(/\.$/, "")
  return (
    name.includes(".") && !PRIVATE_NAME.test(name) && !IP_LITERAL.test(name)
  )
}

// Loopback, private, link-local (cloud metadata), shared, multicast and reserved ranges.
const INTERNAL = new BlockList()
for (const [net, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
  ["224.0.0.0", 3],
] as const)
  INTERNAL.addSubnet(net, prefix, "ipv4")
for (const [net, prefix] of [
  ["::", 127],
  ["fc00::", 7],
  ["fe80::", 10],
] as const)
  INTERNAL.addSubnet(net, prefix, "ipv6")

/** True for an address on the public internet (IPv4-mapped IPv6 included). */
export function isPublicAddress(address: string): boolean {
  return !INTERNAL.check(address, isIPv4(address) ? "ipv4" : "ipv6")
}

/** True when the page's HTML loads CrawlRadar for this site (script or pixel). */
export function pageHasSnippet(html: string, siteId: string): boolean {
  const id = siteId.toLowerCase()
  const text = html.toLowerCase()
  return text.includes(`t.js?s=${id}`) || text.includes(`sid=${id}`)
}
