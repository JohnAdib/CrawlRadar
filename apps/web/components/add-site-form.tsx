"use client"

import { Button } from "@crawlradar/ui/components/button"
import { Field, FieldError } from "@crawlradar/ui/components/field"
import { Input } from "@crawlradar/ui/components/input"
import { Plus } from "lucide-react"
import { useActionState } from "react"

import { addSite } from "@/app/(app)/sites/actions"

export function AddSiteForm() {
  const [state, action, pending] = useActionState(addSite, undefined)

  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-2">
      <Field orientation="horizontal">
        <Input
          name="domain"
          placeholder="example.com"
          aria-label="Website domain"
          aria-invalid={Boolean(state?.error)}
          required
        />
        <Button type="submit" disabled={pending}>
          <Plus /> Add site
        </Button>
      </Field>
      {state?.error && <FieldError>{state.error}</FieldError>}
    </form>
  )
}
