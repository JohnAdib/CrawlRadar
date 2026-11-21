import { redirect } from "next/navigation"

import { DashboardChrome } from "@/components/dashboard/chrome"
import { createClient } from "@/lib/supabase/server"

/** Header and section tabs stay mounted while the views below change. */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("sites")
    .select("id, domain")
    .order("created_at")
  if (!data?.length) redirect("/onboarding")

  // One indexed lookup per site: has any visit been recorded yet?
  const sites = await Promise.all(
    data.map(async (site) => {
      const { data: hit } = await supabase
        .from("crawler_events")
        .select("id")
        .eq("site_id", site.id)
        .limit(1)
      return { ...site, hasData: Boolean(hit?.length) }
    })
  )
  return <DashboardChrome sites={sites}>{children}</DashboardChrome>
}
