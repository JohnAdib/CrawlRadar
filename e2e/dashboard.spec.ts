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
  // PRD 7.1: the overview names the top platform and the top page.
  await expect(page.getByText(/^Top platform: /)).toBeVisible()
  await expect(page.getByText(/^Top page: \//)).toBeVisible()
  await expect(page.getByText("Visits by platform")).toBeVisible()
  await expect(page.getByText("Top pages")).toBeVisible()
})

test("the date range changes the numbers (AC-4); filters are kept in the URL", async ({
  page,
}) => {
  const card = page
    .locator("[data-slot=card]")
    .filter({ hasText: "AI crawler visits" })
    .first()
  const visits = async () =>
    Number(
      // biome-ignore lint/performance/useDomNodeTextContent: innerText keeps the line break between the number and its delta
      (await card.innerText())
        .match(/AI crawler visits\s+([\d,]+)/)?.[1]
        ?.replaceAll(",", "") ?? -1
    )
  // The 7-day number, once its counter has finished animating.
  let week = -1
  await expect(async () => {
    week = await visits()
    await page.waitForTimeout(300)
    expect(week).toBeGreaterThan(0)
    expect(await visits()).toBe(week)
  }).toPass()

  await page.getByRole("radio", { name: "Last 30 days" }).click()
  await expect(page).toHaveURL(/range=30d/)
  await expect.poll(visits).toBeGreaterThan(week)
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
  // A page report lists who read that page and when, instead of the latest 10 visits.
  const visits = page
    .locator("[data-slot=card]")
    .filter({ hasText: "Every visit to /pricing" })
  await expect(visits.locator("tbody tr").first()).toBeVisible()
  await expect(visits.getByRole("columnheader", { name: "Page" })).toHaveCount(
    0
  )
  await expect(page.getByText("Recent activity")).toHaveCount(0)
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
  // Exactly the PRD appendix format.
  const [header, first] = text.split("\n")
  expect(header).toBe(
    "timestamp,page_url,bot_name,platform,bot_type,user_agent"
  )
  expect(first).toMatch(
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ,\/[^,]*,[^,]+,[^,]+,[a-z_]+,".*"$/
  )
})

test("the five views: platforms, pages with search, an endless activity log", async ({
  page,
}) => {
  await page.getByRole("link", { name: "Platforms", exact: true }).click()
  await expect(page.getByText("Share of visits")).toBeVisible()
  await page.getByRole("button", { name: "Anthropic" }).click()
  await expect(page).toHaveURL(/\/dashboard\?.*platform=Anthropic/)
  await expect(page.getByText("Platform report")).toBeVisible()

  await page.goto("/dashboard/pages")
  await page.getByLabel("Search pages").fill("pricing")
  await expect(page.getByRole("button", { name: "/pricing" })).toBeVisible()
  await expect(page.getByRole("button", { name: "/about" })).toHaveCount(0)

  // The header stays put between views; only the content changes.
  await expect(
    page.getByRole("heading", { name: "AI crawler activity" })
  ).toBeVisible()

  // The log loads the next batch as you scroll, with no pages to click.
  await page.goto("/dashboard/activity?range=30d")
  const rows = page.locator("tbody tr")
  await expect(rows.first()).toBeVisible()
  const first = await rows.count()
  // Scrolling down keeps loading: no pages to click.
  await expect(async () => {
    await page.mouse.wheel(0, 6000)
    expect(await rows.count()).toBeGreaterThanOrEqual(first + 50)
  }).toPass({ timeout: 15_000 })
  // Changing a filter starts the list again.
  await page.getByRole("radio", { name: "Search engine" }).click()
  await expect(page).toHaveURL(/type=search_engine/)
  await expect(page.getByText("Googlebot").first()).toBeVisible()
  await expect(page.getByText("GPTBot")).toHaveCount(0)
})

test("signs out after a confirmation", async ({ page }) => {
  await page.getByRole("button", { name: "Sign out" }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByText("Sign out of CrawlRadar?")).toBeVisible()
  await dialog.getByRole("button", { name: "Cancel" }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByRole("button", { name: "Sign out" }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Sign out" })
    .click()
  await expect(page).toHaveURL(/\/login/)
})
