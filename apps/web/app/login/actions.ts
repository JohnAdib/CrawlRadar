"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

function credentials(form: FormData) {
  return {
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  }
}

function fail(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`)
}

export async function signIn(form: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(credentials(form))
  if (error) fail(error.message)
  redirect("/dashboard")
}

export async function signUp(form: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp(credentials(form))
  if (error) fail(error.message)
  // Projects with email confirmation on return no session until the link is clicked.
  if (!data.session)
    fail("Check your inbox to confirm your email, then sign in.")
  redirect("/sites")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
