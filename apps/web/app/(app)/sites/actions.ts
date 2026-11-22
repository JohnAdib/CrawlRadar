"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export type AddSiteState =
  // `value` echoes the input back so the field keeps what was typed after an error.
  | { error: string; value: string; site?: undefined }
  | { site: { id: string; domain: string }; error?: undefined }
  | undefined

/** Accepts "example.com", "https://www.example.com/blog" etc. and returns "example.com". */
function normalizeDomain(input: string): string | null {
  const value = input.trim().toLowerCase()
  if (!value) return null
  try {
    const host = new URL(value.includes("://") ? value : `https://${value}`)
      .hostname
    return host.length <= 253 &&
      /^[a-z0-9.-]+\.[a-z0-9-]+$|^localhost$/.test(host)
      ? host.replace(/^www\./, "")
      : null
  } catch {
    return null
  }
}

export async function addSite(
  _prev: AddSiteState,
  form: FormData
): Promise<AddSiteState> {
  const value = String(form.get("domain") ?? "")
  const domain = normalizeDomain(value)
  if (!domain) return { error: "Enter a valid domain, like example.com", value }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sites")
    .insert({ domain })
    .select("id, domain")
    .single()
  if (error) {
    return {
      error:
        error.code === "23505" ? `${domain} is already added` : error.message,
      value,
    }
  }

  revalidatePath("/sites")
  revalidatePath("/dashboard")
  return { site: data }
}

export async function deleteSite(id: string) {
  const supabase = await createClient()
  await supabase.from("sites").delete().eq("id", id)
  revalidatePath("/sites")
  revalidatePath("/dashboard")
}
