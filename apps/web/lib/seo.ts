// Site identity and social preview helpers, shared by metadata, the OG image route,
// the manifest, robots.txt and the sitemap.

export const SITE_NAME = "CrawlRadar"
export const TAGLINE = "See which AI bots read your website"
export const DESCRIPTION =
  "Open-source AI crawler analytics. See which AI bots like GPTBot, ClaudeBot and PerplexityBot visit your site, what they read, and how many people AI assistants send you."

/** Public URL of the app: explicit setting, then Vercel's production URL, then localhost. */
export function siteUrl(env: Record<string, string | undefined> = process.env) {
  if (env.NEXT_PUBLIC_SITE_URL)
    return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  if (env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  return "http://localhost:3000"
}

/** Path of a social preview image (1200x630) with the given title and subtitle. */
export function ogImage(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title })
  if (subtitle) params.set("subtitle", subtitle)
  return `/api/og?${params}`
}

/** Title and description for a link to a private page, without revealing its data. */
export function privatePagePreview(next: string | undefined): {
  title: string
  description: string
} {
  if (next?.startsWith("/sites/"))
    return {
      title: "A site on CrawlRadar",
      description:
        "Sign in to see this site's AI crawler activity, its tracking snippet and settings.",
    }
  if (next?.startsWith("/sites"))
    return {
      title: "Your sites on CrawlRadar",
      description:
        "Sign in to manage the websites you track and install the one-line snippet.",
    }
  if (next?.startsWith("/dashboard"))
    return {
      title: "AI crawler dashboard",
      description:
        "Sign in to see which AI crawlers read this site, its top pages, platforms and AI referrals.",
    }
  return {
    title: "Sign in",
    description:
      "Sign in to CrawlRadar to see which AI crawlers read your websites.",
  }
}

/** Only same-site relative paths are allowed as a post-sign-in destination. */
export function safeNext(next: string | null | undefined): string {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
}
