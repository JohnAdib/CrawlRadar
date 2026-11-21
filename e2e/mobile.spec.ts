import { expect, type Page, test } from "@playwright/test"

import { signIn } from "./helpers"

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  )
  expect(overflow).toBeLessThanOrEqual(0)
}

test("home page and demo fit a phone screen", async ({ page }) => {
  await page.goto("/")
  await expect(
    page.locator("#demo").getByText("AI crawler visits", { exact: true })
  ).toBeVisible()
  await expectNoHorizontalScroll(page)
})

test("dashboard and sites fit a phone screen", async ({ page }) => {
  await signIn(page)
  await expect(
    page.getByText("AI crawler visits", { exact: true })
  ).toBeVisible()
  await expectNoHorizontalScroll(page)
  await page.getByRole("link", { name: "Sites" }).click()
  await expect(page.getByRole("heading", { name: "Sites" })).toBeVisible()
  await expectNoHorizontalScroll(page)
})
