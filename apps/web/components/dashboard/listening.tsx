import { Card, CardContent } from "@crawlradar/ui/components/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@crawlradar/ui/components/empty"

import { Animation } from "@/components/animation"
import { AutoRefresh } from "@/components/auto-refresh"
import { CopyBlock } from "@/components/copy-block"
import { ScriptPlacement } from "@/components/install/placement"
import { LiveDot } from "@/components/live-dot"

/** A site with no data yet: the snippet again, and a live wait for the first visit. */
export function Listening({ domain, code }: { domain: string; code: string }) {
  return (
    <Card className="fade-in slide-in-from-bottom-2 animate-in duration-500 motion-reduce:animate-none">
      <AutoRefresh seconds={10} />
      <CardContent>
        <Empty className="py-8">
          <EmptyHeader className="max-w-md">
            <EmptyMedia>
              <Animation name="radar" className="size-36" />
            </EmptyMedia>
            <EmptyTitle className="text-xl">
              Listening for AI crawlers
            </EmptyTitle>
            <EmptyDescription>
              Once the tag is on every page of{" "}
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline underline-offset-4"
              >
                {domain}
              </a>
              , <ScriptPlacement />, the first GPTBot, ClaudeBot or ChatGPT
              referral appears here on its own. AI crawlers visit on their own
              schedule, from minutes to a few days.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="w-full max-w-xl">
            <CopyBlock
              code={code}
              label="Snippet"
              className="w-full text-left"
            />
            <p className="flex items-center gap-2 text-muted-foreground text-xs">
              <LiveDot />
              Checking for new visits every 10 seconds
            </p>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  )
}
