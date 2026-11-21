import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { safeNext } from "@/lib/seo"

// Refreshes the Supabase session cookie and gates the signed-in app.
// The home page, /t.js and /api/collect stay public (see `matcher`).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(toSet) {
          for (const { name, value } of toSet) request.cookies.set(name, value)
          response = NextResponse.next({ request })
          for (const { name, value, options } of toSet)
            response.cookies.set(name, value, options)
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const signedIn = Boolean(data?.claims)
  const path = request.nextUrl.pathname

  if (path === "/") return response
  if (path.startsWith("/login")) {
    const next = request.nextUrl.searchParams.get("next")
    return signedIn
      ? NextResponse.redirect(new URL(safeNext(next), request.url))
      : response
  }
  if (!signedIn) {
    // Remember where the link pointed, so sign-in (and link previews) can use it.
    const login = new URL("/login", request.url)
    login.searchParams.set("next", path + request.nextUrl.search)
    return NextResponse.redirect(login)
  }
  return response
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/onboarding",
    "/dashboard/:path*",
    "/sites/:path*",
    "/export",
  ],
}
