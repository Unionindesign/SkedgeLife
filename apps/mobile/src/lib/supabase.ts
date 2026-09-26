// supabase-js needs a complete URL implementation; React Native's is partial.
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@skedgelife/types";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY. Copy apps/mobile/.env.example to apps/mobile/.env.",
  );
}

export const supabase = createClient<Database>(url, key, {
  auth: { persistSession: false },
});
