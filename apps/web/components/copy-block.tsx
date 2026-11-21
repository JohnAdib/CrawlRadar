"use client"

import { Button } from "@crawlradar/ui/components/button"
import { cn } from "@crawlradar/ui/lib/utils"
import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function CopyBlock({
  code,
  label,
  className,
}: {
  code: string
  label: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success(`${label} copied`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("group relative", className)}>
      <pre className="rounded-lg border bg-muted p-3 pr-12 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
      <Button
        size="icon-sm"
        variant="ghost"
        className="absolute top-1.5 right-1.5"
        onClick={copy}
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="text-green-600" /> : <Copy />}
      </Button>
    </div>
  )
}
