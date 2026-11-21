import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

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
    return signedIn
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : response
  }
  if (!signedIn) return NextResponse.redirect(new URL("/login", request.url))
  return response
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/sites/:path*", "/export"],
}
