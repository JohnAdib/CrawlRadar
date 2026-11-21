// Fails when a hand-written source file grows past MAX_LINES, to keep modules small.
// Run: node scripts/check-file-size.mjs (part of `pnpm lint`).
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const MAX_LINES = 200
const SOURCE = /\.(ts|tsx|js|mjs)$/
// Generated or vendored code keeps its upstream shape.
const IGNORED = [
  /^packages\/ui\/src\/components\//,
  /database\.types\.ts$/,
  /next-env\.d\.ts$/,
]

const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" }
)
  .split("\n")
  .filter((f) => SOURCE.test(f) && !IGNORED.some((re) => re.test(f)))

const tooLong = files
  .map((file) => ({
    file,
    lines: readFileSync(file, "utf8").split("\n").length,
  }))
  .filter(({ lines }) => lines > MAX_LINES)

for (const { file, lines } of tooLong) {
  console.error(`${file}: ${lines} lines (max ${MAX_LINES})`)
}
if (tooLong.length) process.exit(1)
console.log(`File size: ${files.length} files, all within ${MAX_LINES} lines.`)
