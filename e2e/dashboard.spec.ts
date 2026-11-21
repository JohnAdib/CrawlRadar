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
  await page.getByRole("combobox", { name: "Bot type" }).click()
  await page.getByRole("option", { name: "AI referral" }).click()
  await expect(page).toHaveURL(/type=referral/)
  await page.getByRole("button", { name: "Clear filters" }).click()
  await expect(page).not.toHaveURL(/type=/)
})

test("exports the current view and all data as CSV", async ({ page }) => {
  await page.getByRole("button", { name: /CSV/ }).click()
  const view = page.waitForEvent("download")
  await page.getByRole("menuitem", { name: "Current view" }).click()
  expect((await view).suggestedFilename()).toBe(
    "crawlradar-demo.crawlradar.dev-7d.csv"
  )

  await page.getByRole("button", { name: /CSV/ }).click()
  const all = page.waitForEvent("download")
  await page.getByRole("menuitem", { name: "All data for this site" }).click()
  const file = await all
  expect(file.suggestedFilename()).toBe(
    "crawlradar-demo.crawlradar.dev-all.csv"
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
