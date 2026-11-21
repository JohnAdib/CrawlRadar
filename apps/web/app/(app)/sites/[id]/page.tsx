import { redirect } from "next/navigation"

/** Old per-site page: a site's settings now live in the dashboard's Settings view. */
export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/dashboard/settings?site=${encodeURIComponent(id)}`)
}
