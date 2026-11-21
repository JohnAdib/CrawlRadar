import { redirect } from "next/navigation"

import { AppHeader } from "@/components/app-header"
import { createClient } from "@/lib/supabase/server"

/**
 * The signed-in app. Until a site's snippet has been seen working, everything here is
 * locked and the user is sent through onboarding.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const [{ data }, { count }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase
      .from("sites")
      .select("id", { count: "exact", head: true })
      .not("installed_at", "is", null),
  ])
  if (!count) redirect("/onboarding")

  return (
    <div className="min-h-svh bg-muted/40">
      <AppHeader email={data?.claims.email} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
