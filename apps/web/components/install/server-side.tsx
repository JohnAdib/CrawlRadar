"use client"

import { Button } from "@crawlradar/ui/components/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@crawlradar/ui/components/tabs"
import { KeyRound } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { createServerKey } from "@/app/(app)/dashboard/settings/actions"
import { CopyBlock } from "@/components/copy-block"
import { SERVER_EXAMPLES } from "@/lib/server-code"

function Step({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-medium text-sm">
        {n}. {title}
      </h3>
      {children}
    </section>
  )
}

/** Step 1: the secret key, created here and shown once. */
function ServerKey({
  siteId,
  hasKey,
  demo,
}: {
  siteId: string
  hasKey: boolean
  demo?: boolean
}) {
  const [key, setKey] = useState<string | null>(null)
  const [active, setActive] = useState(hasKey)
  const [confirming, setConfirming] = useState(false)
  const [pending, start] = useTransition()

  const create = () => {
    setConfirming(false)
    if (demo) {
      toast("This is example data", {
        description: "Sign up to create a server key for your own site.",
      })
      return
    }
    start(async () => {
      const result = await createServerKey(siteId).catch(() => ({
        error: "Couldn't create a key, try again",
      }))
      if ("error" in result) toast.error(result.error)
      else {
        setKey(result.key)
        setActive(true)
      }
    })
  }

  if (key)
    return (
      <>
        <CopyBlock code={key} label="Server key" />
        <p className="text-muted-foreground text-xs">
          Shown once. Save it as <code>CRAWLRADAR_KEY</code> in your
          server&apos;s environment, never in page code.
        </p>
      </>
    )
  if (confirming)
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span>The current key stops working. Replace it?</span>
        <Button size="sm" variant="destructive" onClick={create}>
          Replace key
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    )
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        size="sm"
        variant={active ? "outline" : "default"}
        disabled={pending}
        onClick={active ? () => setConfirming(true) : create}
      >
        <KeyRound /> {active ? "Replace key" : "Create server key"}
      </Button>
      {active && (
        <span className="text-muted-foreground text-xs">
          A key is active for this site.
        </span>
      )}
    </div>
  )
}

/** Server-side tracking: a key, then a few lines in the site's middleware or CDN. */
export function ServerSide({
  origin,
  siteId,
  domain,
  hasKey,
  demo,
}: {
  origin: string
  siteId: string
  domain: string
  hasKey: boolean
  demo?: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-xs">
        Your server reports every page request, so crawlers that only read the
        HTML are counted too. Use it alongside Hybrid: a page view reported by
        both is counted once.
      </p>
      <Step n={1} title="Create a server key">
        <ServerKey siteId={siteId} hasKey={hasKey} demo={demo} />
      </Step>
      <Step n={2} title="Report each page request">
        <Tabs defaultValue={SERVER_EXAMPLES[0]!.id}>
          <TabsList className="h-auto max-w-full flex-wrap justify-start">
            {SERVER_EXAMPLES.map((e) => (
              <TabsTrigger key={e.id} value={e.id}>
                {e.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {SERVER_EXAMPLES.map((e) => (
            <TabsContent
              key={e.id}
              value={e.id}
              className="flex flex-col gap-2"
            >
              <p className="text-muted-foreground text-xs">In {e.file}:</p>
              <CopyBlock
                code={e.code(origin, domain)}
                label={`${e.label} code`}
                lang={e.lang}
              />
            </TabsContent>
          ))}
        </Tabs>
      </Step>
    </div>
  )
}
