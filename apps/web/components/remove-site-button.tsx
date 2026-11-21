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
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { deleteSite } from "@/app/(app)/sites/actions"

export function RemoveSiteButton({
  id,
  domain,
}: {
  id: string
  domain: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function remove() {
    startTransition(async () => {
      await deleteSite(id)
      toast.success(`${domain} removed`)
      router.push("/sites")
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 /> Remove site
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove {domain}?</DialogTitle>
          <DialogDescription>
            This deletes the site and all of its crawler data. It can&apos;t be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={remove} disabled={pending}>
            {pending && <Spinner />} Remove site
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
