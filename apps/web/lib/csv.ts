// CSV export, written with PapaParse (RFC 4180 quoting).
import Papa from "papaparse"

/**
 * Rows as CSV with CRLF line endings. `escapeFormulae` neutralises cells that spreadsheets
 * would run as formulas ("CSV injection"): user agents and URLs come from untrusted visitors.
 */
export function toCsv(
  columns: readonly string[],
  rows: Record<string, unknown>[],
  header = true
): string {
  if (rows.length === 0 && !header) return ""
  const csv = Papa.unparse(
    {
      fields: [...columns],
      data: rows.map((row) => columns.map((c) => row[c] ?? null)),
    },
    { header, newline: "\r\n", escapeFormulae: true }
  )
  // Papa ends a header-only file with a newline but not one with rows: normalise to one.
  return `${csv.replace(/\r\n$/, "")}\r\n`
}
