// Minimal RFC 4180 CSV writer.

// User agents and URLs come from untrusted visitors. Cells starting with these characters are
// run as formulas by Excel/Sheets ("CSV injection"), so they get a leading apostrophe.
const FORMULA_START = /^[=+\-@\t\r]/

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  let text = String(value)
  if (FORMULA_START.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function csvRow(values: unknown[]): string {
  return `${values.map(csvCell).join(",")}\r\n`
}
