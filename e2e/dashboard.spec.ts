import { expect, test } from "@playwright/test"

import { signIn } from "./helpers"

test.beforeEach(async ({ page }) => {
  await signIn(page)
})

test("shows the demo site's crawler activity", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "AI crawler activity" })
  ).toBeVisible()
  for (const card of [
    "AI crawler visits",
    "AI referrals",
    "Active crawlers",
    "Pages crawled",
  ]) {
    await expect(page.getByText(card, { exact: true })).toBeVisible()
  }
  await expect(page.getByText("Visits by platform")).toBeVisible()
  await expect(page.getByText("Top pages")).toBeVisible()
})

test("filters are kept in the URL", async ({ page }) => {
  await page.getByRole("radio", { name: "Last 30 days" }).click()
  await expect(page).toHaveURL(/range=30d/)
  // On desktop every bot type is a one-click segment.
  await page.getByRole("radio", { name: "Referral" }).click()
  await expect(page).toHaveURL(/type=referral/)
  await page.getByRole("button", { name: "Clear filters" }).click()
  await expect(page).not.toHaveURL(/type=/)
})

test("pages and platforms open their own reports", async ({ page }) => {
  await page
    .getByRole("button", { name: /\/pricing/ })
    .first()
    .click()
  await expect(page).toHaveURL(/page=%2Fpricing/)
  await expect(page.getByText("Page report")).toBeVisible()
  await expect(page.getByRole("link", { name: "Open page" })).toHaveAttribute(
    "href",
    "https://crawlradar.vercel.app/pricing"
  )
  await page.getByRole("button", { name: "Overview" }).click()
  await expect(page).not.toHaveURL(/page=/)

  await page
    .getByRole("button", { name: /^OpenAI/ })
    .first()
    .click()
  await expect(page).toHaveURL(/platform=OpenAI/)
  await expect(page.getByText("Platform report")).toBeVisible()
  await expect(page.getByText("GPTBot").first()).toBeVisible()
  await expect(page.getByText("ClaudeBot")).toHaveCount(0)
})

test("exports the current view and all data as CSV", async ({ page }) => {
  await page.getByRole("button", { name: /CSV/ }).click()
  const view = page.waitForEvent("download")
  await page.getByRole("menuitem", { name: "Current view" }).click()
  expect((await view).suggestedFilename()).toBe(
    "crawlradar-crawlradar.vercel.app-7d.csv"
  )

  await page.getByRole("button", { name: /CSV/ }).click()
  const all = page.waitForEvent("download")
  await page.getByRole("menuitem", { name: "All data for this site" }).click()
  const file = await all
  expect(file.suggestedFilename()).toBe(
    "crawlradar-crawlradar.vercel.app-all.csv"
  )
  const stream = await file.createReadStream()
  const text = await new Response(stream as unknown as ReadableStream).text()
  expect(text.split("\r\n")[0]).toBe(
    "timestamp,page_url,bot_name,platform,bot_type,user_agent,page_path,referrer,ip_hash"
  )
})

test("signs out", async ({ page }) => {
  await page.getByRole("button", { name: "Sign out" }).click()
  await expect(page).toHaveURL(/\/login/)
})
