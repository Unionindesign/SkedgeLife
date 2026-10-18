import { createClient } from "@supabase/supabase-js";
import type { SkedgeLifeClient } from "@skedgelife/data";

// Public pages read only what row-level security makes public, with the
// publishable key and no session. Signing in on the web comes with #19.
export function publicClient(): SkedgeLifeClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !key)
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY (see apps/web/.env.example).");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) as SkedgeLifeClient;
}
