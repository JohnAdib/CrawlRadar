import { type Browser, expect, test } from "@playwright/test"

import { hit, onboard } from "./helpers"

// Each test signs up and completes onboarding, which waits for a real tracking hit.
test.slow()

async function newUser(browser: Browser, domain: string) {
  const context = await browser.newContext()
  const page = await context.newPage()
  const { siteId } = await onboard(page, domain)
  return { context, page, siteId }
}

test("two accounts with the same domain never see each other's data", async ({
  browser,
}) => {
  const domain = `shared-${Date.now()}.test`
  const alice = await newUser(browser, domain)
  const bob = await newUser(browser, domain)
  expect(bob.siteId).not.toBe(alice.siteId)

  // Each site gets its own crawler visit.
  expect(
    (await hit(alice.page, alice.siteId, `https://${domain}/alice-secret`)).ok()
  ).toBe(true)
  expect(
    (await hit(bob.page, bob.siteId, `https://${domain}/bob-page`)).ok()
  ).toBe(true)
  for (const [user, path] of [
    [alice, "/alice-secret"],
    [bob, "/bob-page"],
  ] as const) {
    await expect(async () => {
      await user.page.goto("/dashboard")
      await expect(user.page.getByText(path).first()).toBeVisible({
        timeout: 1000,
      })
    }).toPass({ timeout: 15_000 })
  }
  await expect(bob.page.getByText("/alice-secret")).toHaveCount(0)

  // Asking for Alice's site by ID, in any view, shows Bob his own site, never Alice's.
  for (const view of ["", "/pages", "/activity", "/settings"]) {
    await bob.page.goto(`/dashboard${view}?site=${alice.siteId}`)
    await expect(bob.page.getByText(domain).first()).toBeVisible()
    await expect(bob.page.getByText("/alice-secret")).toHaveCount(0)
    await expect(bob.page.getByText(alice.siteId)).toHaveCount(0)
  }

  // Alice's CSV export is invisible to Bob.
  const csv = await bob.page.request.get(`/export?site=${alice.siteId}`)
  expect(csv.status()).toBe(404)
  expect(await csv.text()).not.toContain("alice-secret")

  await alice.context.close()
  await bob.context.close()
})

test("a copied snippet on another domain cannot inject visits", async ({
  browser,
}) => {
  const domain = `owner-${Date.now()}.test`
  const owner = await newUser(browser, domain)

  // Someone pastes the public snippet on their own site: those hits are dropped.
  for (const url of ["https://evil.test/", `https://${domain}.evil.test/`]) {
    await hit(owner.page, owner.siteId, url)
  }
  // A real visit on the owner's domain counts.
  await hit(owner.page, owner.siteId, `https://www.${domain}/real`)

  await expect(async () => {
    await owner.page.goto("/dashboard/activity")
    await expect(owner.page.getByText("/real").first()).toBeVisible({
      timeout: 1000,
    })
  }).toPass({ timeout: 15_000 })
  await expect(owner.page.getByText("That's all 1 visit")).toBeVisible()
  await expect(owner.page.getByText("evil.test")).toHaveCount(0)

  await owner.context.close()
})
