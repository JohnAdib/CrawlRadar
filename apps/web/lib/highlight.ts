// Syntax highlighting for the code people copy (tracking tags, middleware examples).
// Loaded on demand, so a code block shows plain text first. Both themes' colours come
// back as CSS variables (--shiki-light, --shiki-dark) and CSS picks one per theme.
import {
  createHighlighterCore,
  type HighlighterCore,
  type ThemedToken,
} from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"

export type CodeLang = "html" | "tsx" | "javascript" | "shellscript"

let highlighter: Promise<HighlighterCore> | undefined

/** `code` as lines of tokens, each token styled with its light and dark colour. */
export async function highlight(
  code: string,
  lang: CodeLang
): Promise<ThemedToken[][]> {
  highlighter ??= createHighlighterCore({
    themes: [
      import("shiki/themes/github-light.mjs"),
      import("shiki/themes/github-dark.mjs"),
    ],
    langs: [
      import("shiki/langs/html.mjs"),
      import("shiki/langs/tsx.mjs"),
      import("shiki/langs/javascript.mjs"),
      import("shiki/langs/shellscript.mjs"),
    ],
    // The JavaScript regex engine: no WebAssembly to download.
    engine: createJavaScriptRegexEngine(),
  })
  const { tokens } = (await highlighter).codeToTokens(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  })
  return tokens
}
