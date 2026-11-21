import { type Browser, expect, type Page, test } from "@playwright/test"

import { signUp } from "./helpers"

const GPTBOT =
  "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)"

async function addSite(page: Page, domain: string): Promise<string> {
  await page.goto("/sites")
  await page.getByRole("button", { name: "Add website" }).first().click()
  await page.getByLabel("Domain").fill(domain)
  await page.getByRole("button", { name: "Add website" }).last().click()
  await expect(page.getByText(`${domain} is ready`)).toBeVisible()
  const snippet = await page
    .getByRole("dialog")
    .locator("pre code")
    .textContent()
  await page.getByRole("button", { name: "Done" }).click()
  return snippet!.match(/s=([0-9a-f-]{36})/)![1]!
}

async function newUser(browser: Browser) {
  const context = await browser.newContext()
  const page = await context.newPage()
  await signUp(page)
  return { context, page }
}

test("two accounts with the same domain never see each other's data", async ({
  browser,
}) => {
  const domain = `shared-${Date.now()}.test`
  const alice = await newUser(browser)
  const bob = await newUser(browser)

  const aliceSite = await addSite(alice.page, domain)
  const bobSite = await addSite(bob.page, domain)
  expect(bobSite).not.toBe(aliceSite)

  // Alice's site gets a crawler visit.
  const hit = await alice.page.request.get(
    `/api/collect?t=img&sid=${aliceSite}&u=${encodeURIComponent(`https://${domain}/alice-secret`)}`,
    { headers: { "user-agent": GPTBOT } }
  )
  expect(hit.ok()).toBe(true)
  await expect(async () => {
    await alice.page.goto("/dashboard")
    await expect(alice.page.getByText("/alice-secret").first()).toBeVisible({
      timeout: 1000,
    })
  }).toPass({ timeout: 15_000 })

  // Bob, with the same domain, still has an empty site.
  await bob.page.goto("/dashboard")
  await expect(bob.page.getByText("Listening for AI crawlers")).toBeVisible()

  // Asking for Alice's site by ID shows Bob his own site, never Alice's.
  await bob.page.goto(`/dashboard?site=${aliceSite}`)
  await expect(bob.page.getByText("Listening for AI crawlers")).toBeVisible()
  await expect(bob.page.getByText("/alice-secret")).toHaveCount(0)

  // Alice's site page and CSV export are invisible to Bob.
  await bob.page.goto(`/sites/${aliceSite}`)
  await expect(bob.page.getByText("Page not found")).toBeVisible()
  await expect(bob.page.getByText(aliceSite)).toHaveCount(0)
  const csv = await bob.page.request.get(`/export?site=${aliceSite}`)
  expect(csv.status()).toBe(404)
  expect(await csv.text()).not.toContain("alice-secret")

  await alice.context.close()
  await bob.context.close()
})

test("a copied snippet on another domain cannot inject visits", async ({
  browser,
}) => {
  const domain = `owner-${Date.now()}.test`
  const owner = await newUser(browser)
  const siteId = await addSite(owner.page, domain)

  // Someone pastes the public snippet on their own site: those hits are dropped.
  for (const page of ["https://evil.test/", `https://${domain}.evil.test/`]) {
    await owner.page.request.get(
      `/api/collect?t=img&sid=${siteId}&u=${encodeURIComponent(page)}`,
      { headers: { "user-agent": GPTBOT } }
    )
  }
  // A real visit on the owner's domain counts.
  await owner.page.request.get(
    `/api/collect?t=img&sid=${siteId}&u=${encodeURIComponent(`https://www.${domain}/real`)}`,
    { headers: { "user-agent": GPTBOT } }
  )

  await expect(async () => {
    await owner.page.goto("/dashboard")
    await expect(owner.page.getByText("/real").first()).toBeVisible({
      timeout: 1000,
    })
  }).toPass({ timeout: 15_000 })
  await owner.page.goto(`/sites/${siteId}`)
  await expect(owner.page.getByText("1 visit", { exact: true })).toBeVisible()

  await owner.context.close()
})
