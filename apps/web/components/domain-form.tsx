"use client"

import { Button } from "@crawlradar/ui/components/button"
import { Field, FieldError, FieldLabel } from "@crawlradar/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@crawlradar/ui/components/input-group"
import { Spinner } from "@crawlradar/ui/components/spinner"
import { Plus } from "lucide-react"
import { useActionState, useEffect } from "react"

import { type AddSiteState, addSite } from "@/app/(app)/sites/actions"

export type AddedSite = { id: string; domain: string }

/** Domain input that adds a site. Calls `onAdded` once the site exists. */
export function DomainForm({
  onAdded,
  children,
  submitLabel = "Add website",
}: {
  onAdded: (site: AddedSite) => void
  /** Extra content above the field (a title, for example). */
  children?: React.ReactNode
  submitLabel?: string
}) {
  const [state, action, pending] = useActionState<AddSiteState, FormData>(
    addSite,
    undefined
  )
  const added = state?.site
  const typed = state?.error ? state.value : undefined
  useEffect(() => {
    if (added) onAdded(added)
  }, [added, onAdded])

  return (
    <form action={action} className="flex flex-col gap-6">
      {children}
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
            defaultValue={typed}
            key={typed}
            autoFocus
            required
          />
        </InputGroup>
        {state?.error && <FieldError>{state.error}</FieldError>}
      </Field>
      <Button
        type="submit"
        disabled={pending || Boolean(added)}
        className="self-end"
      >
        {pending ? <Spinner /> : <Plus />}
        {pending ? "Adding..." : submitLabel}
      </Button>
    </form>
  )
}
