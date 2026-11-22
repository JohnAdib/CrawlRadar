"use server"

import { createHash, randomBytes } from "node:crypto"

import { createClient } from "@/lib/supabase/server"

/**
 * Creates the site's server key, replacing any previous one. The key is returned once;
 * only its SHA-256 hash is stored. RLS limits this to the caller's own sites.
 */
export async function createServerKey(
  siteId: string
): Promise<{ key: string } | { error: string }> {
  const key = `crk_${randomBytes(24).toString("base64url")}`
  const supabase = await createClient()
  const { data } = await supabase
    .from("sites")
    .update({
      server_key_hash: createHash("sha256").update(key).digest("hex"),
    })
    .eq("id", siteId)
    .select("id")
    .maybeSingle()
  return data ? { key } : { error: "Couldn't create a key for this site" }
}
