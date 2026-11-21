/* CrawlRadar tracker: <script async src="https://YOUR-CRAWLRADAR/t.js?s=SITE_ID"></script> */
(function (d) {
  var s = d.currentScript, id = s && new URL(s.src).searchParams.get("s")
  if (!id) return
  var q = "?t=img&sid=" + encodeURIComponent(id) +
    "&u=" + encodeURIComponent(location.href) +
    "&r=" + encodeURIComponent(d.referrer)
  new Image().src = new URL("/api/collect" + q, s.src).href
})(document)
