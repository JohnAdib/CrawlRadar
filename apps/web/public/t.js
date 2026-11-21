/* CrawlRadar tracker: <script async src="https://YOUR-CRAWLRADAR/t.js?s=SITE_ID"></script> */
;((d, n) => {
  const s = d.currentScript
  const id = s && new URL(s.src).searchParams.get("s")
  if (!id) return
  const hit = new URLSearchParams({ sid: id, u: location.href, r: d.referrer })
  const url = new URL("/api/collect", s.src).href
  // POST the hit as a beacon; where beacons aren't available, send it as an image.
  if (!n.sendBeacon?.(url, hit)) new Image().src = `${url}?t=img&${hit}`
})(document, navigator)
