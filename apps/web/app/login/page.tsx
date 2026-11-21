import { Alert, AlertDescription } from "@crawlradar/ui/components/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@crawlradar/ui/components/card"
import { Field, FieldGroup, FieldLabel } from "@crawlradar/ui/components/field"
import { Input } from "@crawlradar/ui/components/input"
import { CircleAlert } from "lucide-react"

import type { Metadata } from "next"
import Link from "next/link"

import { LoginButtons } from "@/components/login-buttons"
import { Logo } from "@/components/logo"
import { ogImage, privatePagePreview, safeNext } from "@/lib/seo"
import { SUPABASE_URL } from "@/lib/supabase/server"
import { signIn, signUp } from "./actions"

const isLocal = /127\.0\.0\.1|localhost/.test(SUPABASE_URL)

type Params = Promise<{ error?: string; next?: string }>

// Shared links to private pages land here for anyone signed out, including link-preview
// crawlers. The preview describes where the link goes, without revealing any data.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Params
}): Promise<Metadata> {
  const { next } = await searchParams
  const { title, description } = privatePagePreview(next)
  const image = ogImage(title, description)
  return {
    title,
    description,
    alternates: { canonical: "/login" },
    robots: next ? { index: false } : undefined,
    openGraph: {
      title: `${title} · CrawlRadar`,
      description,
      url: next ? `/login?next=${encodeURIComponent(next)}` : "/login",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · CrawlRadar`,
      description,
      images: [image],
    },
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Params
}) {
  const { error, next } = await searchParams

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6">
      <Link href="/" aria-label="CrawlRadar home">
        <Logo className="text-xl" />
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in or create an account to see which AI crawlers visit your
            site.
          </CardDescription>
        </CardHeader>
        <form>
          <input type="hidden" name="next" value={safeNext(next)} />
          <CardContent>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue={isLocal ? "demo@crawlradar.dev" : undefined}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  minLength={6}
                  required
                />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="mt-6 flex flex-col gap-2">
            <LoginButtons signIn={signIn} signUp={signUp} />
          </CardFooter>
        </form>
      </Card>
      {isLocal && (
        <p className="text-sm text-muted-foreground">
          Local demo: <code>demo@crawlradar.dev</code> /{" "}
          <code>crawlradar-demo</code>
        </p>
      )}
    </main>
  )
}
