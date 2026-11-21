/* CrawlRadar tracker: <script async src="https://YOUR-CRAWLRADAR/t.js?s=SITE_ID"></script> */
;((d) => {
  const s = d.currentScript
  const id = s && new URL(s.src).searchParams.get("s")
  if (!id) return
  const q = new URLSearchParams({
    t: "img",
    sid: id,
    u: location.href,
    r: d.referrer,
  })
  new Image().src = new URL(`/api/collect?${q}`, s.src).href
})(document)
