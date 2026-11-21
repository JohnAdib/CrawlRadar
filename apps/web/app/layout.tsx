import "@crawlradar/ui/globals.css"

import { Toaster } from "@crawlradar/ui/components/sonner"
import { TooltipProvider } from "@crawlradar/ui/components/tooltip"
import { cn } from "@crawlradar/ui/lib/utils"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { DESCRIPTION, ogImage, SITE_NAME, siteUrl, TAGLINE } from "@/lib/seo"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

const defaultTitle = `${SITE_NAME}: ${TAGLINE}`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: defaultTitle, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AI crawler analytics",
    "AI bot tracking",
    "GPTBot",
    "ClaudeBot",
    "PerplexityBot",
    "AI referrals",
    "generative engine optimization",
    "open source analytics",
  ],
  authors: [{ name: "MrAdib", url: "https://github.com/JohnAdib" }],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: defaultTitle,
    description: DESCRIPTION,
    url: "/",
    locale: "en_US",
    images: [{ url: ogImage(TAGLINE), width: 1200, height: 630, alt: TAGLINE }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: DESCRIPTION,
    images: [ogImage(TAGLINE)],
  },
  alternates: { canonical: "/" },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
