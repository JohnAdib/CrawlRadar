"use server"

import { redirect } from "next/navigation"

import { safeNext } from "@/lib/seo"
import { createClient } from "@/lib/supabase/server"

function credentials(form: FormData) {
  return {
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  }
}

function nextOf(form: FormData): string | null {
  const next = form.get("next")
  return typeof next === "string" ? next : null
}

function fail(message: string, form: FormData): never {
  const next = nextOf(form)
  const query = new URLSearchParams({ error: message })
  if (next) query.set("next", safeNext(next))
  redirect(`/login?${query}`)
}

export async function signIn(form: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(credentials(form))
  if (error) fail(error.message, form)
  redirect(safeNext(nextOf(form)))
}

export async function signUp(form: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp(credentials(form))
  if (error) fail(error.message, form)
  // Projects with email confirmation on return no session until the link is clicked.
  if (!data.session)
    fail("Check your inbox to confirm your email, then sign in.", form)
  // New accounts start with onboarding; the app stays locked until it is done.
  redirect("/onboarding")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
