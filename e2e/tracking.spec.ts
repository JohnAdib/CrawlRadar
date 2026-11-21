import { expect, test } from "@playwright/test"

import { signUp } from "./helpers"

test("a new user adds a site, installs the snippet and sees AI traffic", async ({
  page,
}) => {
  await signUp(page)

  // Empty state, then add a website through the dialog.
  await expect(page.getByText("Add your first website")).toBeVisible()
  await page.getByRole("button", { name: "Add website" }).click()
  await page.getByLabel("Domain").fill("not a domain")
  await page.getByRole("button", { name: "Add website" }).last().click()
  await expect(page.getByText("Enter a valid domain")).toBeVisible()
  await expect(page.getByLabel("Domain")).toHaveValue("not a domain")

  const domain = `e2e-${Date.now()}.test`
  await page.getByLabel("Domain").fill(`https://www.${domain}/blog`)
  await page.getByRole("button", { name: "Add website" }).last().click()
  await expect(page.getByText(`${domain} is ready`)).toBeVisible()
  const snippet = (await page
    .getByRole("dialog")
    .locator("code")
    .textContent())!
  expect(snippet).toMatch(
    /^<script async src="http:\/\/localhost:\d+\/t\.js\?s=[0-9a-f-]{36}"><\/script>$/
  )
  const siteId = snippet.match(/s=([0-9a-f-]{36})/)![1]!
  await page.getByRole("button", { name: "Done" }).click()

  // Before any traffic the dashboard listens instead of showing empty charts.
  await page.goto("/dashboard")
  await expect(page.getByText("Listening for AI crawlers")).toBeVisible()
  await expect(page.getByRole("combobox", { name: "Platform" })).toHaveCount(0)

  // A page on the customer's site, embedding the snippet, visited from ChatGPT.
  const customerSite = `http://${domain}`
  await page.route(`${customerSite}/**`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head>${snippet}</head><body>Pricing</body></html>`,
    })
  )
  const collected = page.waitForResponse((r) =>
    r.url().includes("/api/collect")
  )
  await page.goto(`${customerSite}/pricing?utm_source=chatgpt.com`)
  expect((await collected).status()).toBe(200)

  // A crawler that doesn't run JavaScript, hitting the pixel endpoint directly.
  const pixel = await page.request.get(
    `/api/collect?t=img&sid=${siteId}&u=${encodeURIComponent(`https://${domain}/docs`)}`,
    {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      },
    }
  )
  expect(pixel.headers()["content-type"]).toBe("image/gif")

  await expect(async () => {
    await page.goto("/dashboard")
    await expect(page.getByText("GPTBot").first()).toBeVisible({
      timeout: 1000,
    })
  }).toPass({ timeout: 15_000 })
  await expect(page.getByText("ChatGPT").first()).toBeVisible()

  // The sites page now shows the site as live; removing it asks first.
  await page.goto("/sites")
  await expect(page.getByText(/Last hit/)).toBeVisible()
  await page.getByRole("button", { name: `${domain} options` }).click()
  await page.getByRole("menuitem", { name: "Remove site" }).click()
  await expect(page.getByText(`Remove ${domain}?`)).toBeVisible()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove site" })
    .click()
  await expect(page.getByText("Add your first website")).toBeVisible()
})
