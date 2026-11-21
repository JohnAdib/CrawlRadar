"use client"

import { Button } from "@crawlradar/ui/components/button"
import { Spinner } from "@crawlradar/ui/components/spinner"
import { useFormStatus } from "react-dom"

type Action = (form: FormData) => Promise<void>

/** Sign in / Create account submit buttons with a spinner on the one that was pressed. */
export function LoginButtons({
  signIn,
  signUp,
}: {
  signIn: Action
  signUp: Action
}) {
  const { pending, action } = useFormStatus()
  return (
    <>
      <Button formAction={signIn} className="w-full" disabled={pending}>
        {pending && action === signIn && <Spinner />} Sign in
      </Button>
      <Button
        formAction={signUp}
        variant="outline"
        className="w-full"
        disabled={pending}
      >
        {pending && action === signUp && <Spinner />} Create account
      </Button>
    </>
  )
}
