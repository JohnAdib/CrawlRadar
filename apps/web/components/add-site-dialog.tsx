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
import { Field, FieldError, FieldLabel } from "@crawlradar/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@crawlradar/ui/components/input-group"
import { Spinner } from "@crawlradar/ui/components/spinner"
import { Plus } from "lucide-react"
import { createContext, useActionState, useContext, useState } from "react"

import { type AddSiteState, addSite } from "@/app/(app)/sites/actions"
import { Animation } from "@/components/animation"
import { CopyBlock } from "@/components/copy-block"
import { Tag } from "@/components/head-tag"

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
  const [state, action, pending] = useActionState<AddSiteState, FormData>(
    addSite,
    undefined
  )

  if (state?.site) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Animation name="success" className="size-24" />
        <DialogHeader className="items-center">
          <DialogTitle>{state.site.domain} is ready</DialogTitle>
          <DialogDescription>
            Paste this tag into the <Tag /> of every page. Visits show up on the
            dashboard within seconds.
          </DialogDescription>
        </DialogHeader>
        <CopyBlock
          code={`<script async src="${origin}/t.js?s=${state.site.id}"></script>`}
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
    <form action={action} className="flex flex-col gap-6">
      <DialogHeader>
        <DialogTitle>Add a website</DialogTitle>
        <DialogDescription>
          You&apos;ll get a one-line snippet to install. Subdomains count as
          separate sites.
        </DialogDescription>
      </DialogHeader>
      <Field data-invalid={Boolean(state?.error)}>
        <FieldLabel htmlFor="domain">Domain</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id="domain"
            name="domain"
            placeholder="example.com"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            inputMode="url"
            aria-invalid={Boolean(state?.error)}
            defaultValue={state?.value}
            key={state?.value}
            autoFocus
            required
          />
        </InputGroup>
        {state?.error && <FieldError>{state.error}</FieldError>}
      </Field>
      <DialogFooter>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? <Spinner /> : <Plus />}
          {pending ? "Adding..." : "Add website"}
        </Button>
      </DialogFooter>
    </form>
  )
}
