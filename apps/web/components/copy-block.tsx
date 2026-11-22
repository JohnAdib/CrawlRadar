"use client"

import { Button } from "@crawlradar/ui/components/button"
import { cn } from "@crawlradar/ui/lib/utils"
import { Check, Copy } from "lucide-react"
import { Fragment, useEffect, useState } from "react"
import type { ThemedToken } from "shiki/core"
import { toast } from "sonner"

import type { CodeLang } from "@/lib/highlight"

/** Highlighted lines for `code`, once the highlighter has loaded (plain text until then). */
function useTokens(code: string, lang?: CodeLang) {
  const [state, setState] = useState<{ code: string; lines: ThemedToken[][] }>()
  useEffect(() => {
    if (!lang) return
    let live = true
    import("@/lib/highlight")
      .then(({ highlight }) => highlight(code, lang))
      .then((lines) => live && setState({ code, lines }))
      // Highlighting is decoration: on failure the plain code stays.
      .catch(() => {})
    return () => {
      live = false
    }
  }, [code, lang])
  return state?.code === code ? state.lines : undefined
}

function Tokens({ lines }: { lines: ThemedToken[][] }) {
  return lines.map((line, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: the lines of a static snippet never reorder
    <Fragment key={i}>
      {i > 0 && "\n"}
      {line.map((token) => (
        <span key={token.offset} style={token.htmlStyle as React.CSSProperties}>
          {token.content}
        </span>
      ))}
    </Fragment>
  ))
}

export function CopyBlock({
  code,
  label,
  className,
  lang,
}: {
  code: string
  label: string
  className?: string
  /** Highlights the code as this language. */
  lang?: CodeLang
}) {
  const [copied, setCopied] = useState(false)
  const lines = useTokens(code, lang)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success(`${label} copied`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("group relative", className)}>
      <pre className="rounded-lg border bg-muted p-3 pr-12 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">
        <code className="code-tokens">
          {lines ? <Tokens lines={lines} /> : code}
        </code>
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
