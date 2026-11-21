import { Alert, AlertDescription } from "@crawlradar/ui/components/alert"
import { Button } from "@crawlradar/ui/components/button"
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

import { Logo } from "@/components/logo"
import { SUPABASE_URL } from "@/lib/supabase/server"
import { signIn, signUp } from "./actions"

const isLocal = /127\.0\.0\.1|localhost/.test(SUPABASE_URL)

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6">
      <Logo className="text-xl" />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in or create an account to see which AI crawlers visit your
            site.
          </CardDescription>
        </CardHeader>
        <form>
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
            <Button formAction={signIn} className="w-full">
              Sign in
            </Button>
            <Button formAction={signUp} variant="outline" className="w-full">
              Create account
            </Button>
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
