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

test("sparkline tooltips stay inside their card, even at the edges", async ({
  page,
}) => {
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  const sparks = page.locator("#demo .cursor-crosshair")
  for (const i of [0, 1]) {
    const spark = sparks.nth(i)
    await spark.scrollIntoViewIfNeeded()
    for (const at of [0.01, 0.99]) {
      // Re-measured on every try: the demo animates into view as it scrolls in.
      await expect
        .poll(
          async () => {
            const box = (await spark.boundingBox())!
            await page.mouse.move(
              box.x + box.width * at,
              box.y + box.height / 2
            )
            return spark.evaluate((el) => {
              const tip = el
                .querySelector(".bg-popover")
                ?.getBoundingClientRect()
              const card = el
                .closest("[data-slot=card]")!
                .getBoundingClientRect()
              return (
                Boolean(tip) &&
                tip!.left >= card.left &&
                tip!.right <= card.right
              )
            })
          },
          { message: `card ${i + 1} at ${at}` }
        )
        .toBe(true)
    }
  }
})
