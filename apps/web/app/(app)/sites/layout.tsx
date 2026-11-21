import { AddSiteProvider } from "@/components/add-site-dialog"
import { appOrigin } from "@/lib/snippet"

export default async function SitesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AddSiteProvider origin={await appOrigin()}>{children}</AddSiteProvider>
  )
}
