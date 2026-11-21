import { Button } from "@crawlradar/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@crawlradar/ui/components/empty"
import { Compass } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Page not found" }

export default function NotFound() {
  return (
    <Empty className="min-h-[70svh]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Compass />
        </EmptyMedia>
        <EmptyTitle className="text-xl">Page not found</EmptyTitle>
        <EmptyDescription>
          This page doesn&apos;t exist, or it belongs to another account.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/dashboard">Go to your dashboard</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
