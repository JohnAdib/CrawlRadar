"use client"

import { Button } from "@crawlradar/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@crawlradar/ui/components/dialog"
import { Plus } from "lucide-react"
import { createContext, useContext, useState } from "react"

import { Animation } from "@/components/animation"
import { CopyBlock } from "@/components/copy-block"
import { type AddedSite, DomainForm } from "@/components/domain-form"
import { PixelPlacement } from "@/components/install/placement"
import { hybrid } from "@/lib/snippet"

const OpenAddSite = createContext<() => void>(() => {})

/**
 * Owns the single "Add website" dialog. It lives in the sites layout, so it stays
 * mounted (and keeps showing the success step) when adding the first site swaps the
 * page from its empty state to the site list.
 */
export function AddSiteProvider({
  origin,
  children,
}: {
  origin: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  // Remounting the form on every open resets its state and input.
  const [formKey, setFormKey] = useState(0)
  const openDialog = () => {
    setFormKey((k) => k + 1)
    setOpen(true)
  }

  return (
    <OpenAddSite.Provider value={openDialog}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <AddSiteForm
            key={formKey}
            origin={origin}
            onDone={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </OpenAddSite.Provider>
  )
}

export function AddSiteButton({
  label = "Add website",
  size = "default",
}: {
  label?: string
  size?: "default" | "lg"
}) {
  const open = useContext(OpenAddSite)
  return (
    <Button size={size} onClick={open}>
      <Plus /> {label}
    </Button>
  )
}

function AddSiteForm({
  origin,
  onDone,
}: {
  origin: string
  onDone: () => void
}) {
  const [site, setSite] = useState<AddedSite | null>(null)

  if (site) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Animation name="success" className="size-24" />
        <DialogHeader className="items-center">
          <DialogTitle>{site.domain} is ready</DialogTitle>
          <DialogDescription>
            Paste this <PixelPlacement /> of every page. The other install
            methods are in the site&apos;s Settings.
          </DialogDescription>
        </DialogHeader>
        <CopyBlock
          code={hybrid(origin, site.id)}
          label="Snippet"
          className="w-full text-left"
        />
        <DialogFooter className="w-full">
          <Button className="w-full" onClick={onDone}>
            Done
          </Button>
        </DialogFooter>
      </div>
    )
  }

  return (
    <DomainForm onAdded={setSite}>
      <DialogHeader>
        <DialogTitle>Add a website</DialogTitle>
        <DialogDescription>
          You&apos;ll get a one-line snippet to install. Subdomains count as
          separate sites.
        </DialogDescription>
      </DialogHeader>
    </DomainForm>
  )
}
