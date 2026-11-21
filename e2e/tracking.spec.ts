import { expect, test } from "@playwright/test"

import { hit, onboard } from "./helpers"

// Each test signs up and completes onboarding, which waits for a real tracking hit.
test.slow()

test("tracked visits flow into every dashboard view, and sites can be managed", async ({
  page,
}) => {
  const domain = `e2e-${Date.now()}.test`
  const { siteId } = await onboard(page, domain)

  // Before any AI traffic the dashboard listens instead of showing empty charts.
  await expect(page.getByText("Listening for AI crawlers")).toBeVisible()
  await expect(page.getByRole("combobox", { name: "Platform" })).toHaveCount(0)
  // The views only appear once there is something to show.
  await expect(
    page.getByRole("navigation", { name: "Dashboard sections" })
  ).toHaveCount(0)

  // A crawler that doesn't run JavaScript, hitting the pixel endpoint directly.
  const pixel = await hit(page, siteId, `https://${domain}/docs`)
  expect(pixel.headers()["content-type"]).toBe("image/gif")
  await hit(
    page,
    siteId,
    `https://${domain}/docs`,
    "Mozilla/5.0 (compatible; DeepSeekBot/1.0)"
  )
  await expect(async () => {
    await page.goto("/dashboard")
    await expect(page.getByText("GPTBot").first()).toBeVisible({
      timeout: 1000,
    })
  }).toPass({ timeout: 15_000 })

  // Each of the five views shows the same visits.
  await page.getByRole("link", { name: "Platforms", exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard\/platforms/)
  await expect(page.getByRole("button", { name: "DeepSeek" })).toBeVisible()
  await page.getByRole("link", { name: "Pages", exact: true }).click()
  await expect(page.getByRole("button", { name: "/docs" })).toBeVisible()
  await page.getByRole("link", { name: "Activity log", exact: true }).click()
  await expect(page.getByText("DeepSeekBot", { exact: true })).toBeVisible()
  await expect(page.getByText("That's all 2 visits")).toBeVisible()
  await page.getByRole("link", { name: "Settings", exact: true }).click()
  await expect(page.getByText(`t.js?s=${siteId}`)).toBeVisible()
  await page.getByRole("tab", { name: "Pixel (no JavaScript)" }).click()
  await expect(page.getByText(`sid=${siteId}`)).toBeVisible()

  // A second site with no data yet: switching shows the install state for it.
  const second = `e2e-second-${Date.now()}.test`
  await page.goto("/sites")
  await page.getByRole("button", { name: "Add website" }).click()
  await page.getByLabel("Domain").fill(second)
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add website" })
    .click()
  await expect(page.getByText(`${second} is ready`)).toBeVisible()
  await page.getByRole("button", { name: "Done" }).click()

  await page.goto("/dashboard")
  await page.getByRole("combobox", { name: "Site" }).click()
  await page.getByRole("option", { name: second }).click()
  await expect(page.getByText("Listening for AI crawlers")).toBeVisible()
  await page.getByRole("combobox", { name: "Site" }).click()
  await page.getByRole("option", { name: domain }).click()
  await expect(page.getByText("GPTBot").first()).toBeVisible()

  // The sites list shows both; a site opens in Settings, where it can be removed.
  await page.goto("/sites")
  await expect(page.getByText(/Last hit/)).toBeVisible()
  await expect(page.getByText("Waiting for first hit")).toBeVisible()
  await page.getByRole("link", { name: new RegExp(domain) }).click()
  await expect(page).toHaveURL(/\/dashboard\/settings/)
  await page.getByRole("button", { name: "Remove site" }).click()
  await expect(page.getByText(`Remove ${domain}?`)).toBeVisible()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove site" })
    .click()
  // The only installed site is gone, so setup resumes for the remaining one.
  await expect(page).toHaveURL(/\/onboarding/)
  await expect(page.getByText("Step 3 of 5")).toBeVisible()
  await expect(page.getByText(second).first()).toBeVisible()
})
