import { expect, type Page } from "@playwright/test"

export const DEMO = {
  email: "demo@crawlradar.dev",
  password: "crawlradar-demo",
}

export async function signIn(page: Page, { email, password } = DEMO) {
  await page.goto("/login")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

export async function signUp(page: Page) {
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@crawlradar.test`
  await page.goto("/login")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill("e2e-password-123")
  await page.getByRole("button", { name: "Create account" }).click()
  await expect(page).toHaveURL(/\/sites/)
  return email
}
