"use client"

import { Button } from "@crawlradar/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@crawlradar/ui/components/dialog"
import { Spinner } from "@crawlradar/ui/components/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@crawlradar/ui/components/tooltip"
import { LogOut } from "lucide-react"
import { useFormStatus } from "react-dom"

import { signOut } from "@/app/login/actions"

function Confirm() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Spinner /> : <LogOut />} Sign out
    </Button>
  )
}

/** Header sign-out, behind a short confirmation. */
export function SignOutButton() {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Sign out">
              <LogOut />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Sign out</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Sign out of CrawlRadar?</DialogTitle>
          <DialogDescription>
            Tracking keeps running on your sites while you are signed out.
          </DialogDescription>
        </DialogHeader>
        <form action={signOut}>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Confirm />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
