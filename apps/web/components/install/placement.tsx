import { Tag } from "@/components/head-tag"

// The one wording for where each tag goes, used everywhere the install is described.

/** "just before </body>, or in the <head>" */
export function ScriptPlacement() {
  return (
    <>
      just before <Tag name="/body" />, or in the <Tag />
    </>
  )
}

/** "just before </body>" */
export function PixelPlacement() {
  return (
    <>
      just before <Tag name="/body" />
    </>
  )
}
