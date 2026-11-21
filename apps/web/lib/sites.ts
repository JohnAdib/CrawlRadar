import type { createClient } from "@/lib/supabase/server"

type Client = Awaited<ReturnType<typeof createClient>>

/** Last hit time and 30-day visit count for a site. */
export async function siteActivity(supabase: Client, siteId: string) {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const [last, count] = await Promise.all([
    supabase
      .from("crawler_events")
      .select("timestamp")
      .eq("site_id", siteId)
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("crawler_events")
      .select("id", { count: "exact", head: true })
      .eq("site_id", siteId)
      .gte("timestamp", since),
  ])
  return { lastSeen: last.data?.timestamp ?? null, visits30d: count.count ?? 0 }
}
