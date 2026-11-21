// The five onboarding steps, in order.
export const STEPS = [
  { id: "account", title: "Create your account", short: "Account" },
  { id: "site", title: "Add your website", short: "Website" },
  { id: "install", title: "Install the snippet", short: "Install" },
  { id: "verify", title: "Check it works", short: "Verify" },
  { id: "explore", title: "Explore your dashboard", short: "Explore" },
] as const

export type StepId = (typeof STEPS)[number]["id"]

export const stepIndex = (id: StepId) => STEPS.findIndex((s) => s.id === id)
