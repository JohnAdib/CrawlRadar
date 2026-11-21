"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export type ActionState = { error?: string } | undefined

/** Accepts "example.com", "https://www.example.com/blog" etc. and returns "example.com". */
function normalizeDomain(input: string): string | null {
  const value = input.trim().toLowerCase()
  if (!value) return null
  try {
    const host = new URL(value.includes("://") ? value : `https://${value}`)
      .hostname
    return /^[a-z0-9.-]+\.[a-z0-9-]+$|^localhost$/.test(host)
      ? host.replace(/^www\./, "")
      : null
  } catch {
    return null
  }
}

export async function addSite(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  const domain = normalizeDomain(String(form.get("domain") ?? ""))
  if (!domain) return { error: "Enter a valid domain, like example.com" }

  const supabase = await createClient()
  const { error } = await supabase.from("sites").insert({ domain })
  if (error)
    return {
      error:
        error.code === "23505" ? `${domain} is already added` : error.message,
    }

  revalidatePath("/sites")
}

export async function deleteSite(form: FormData) {
  const supabase = await createClient()
  await supabase
    .from("sites")
    .delete()
    .eq("id", String(form.get("id")))
  revalidatePath("/sites")
}
