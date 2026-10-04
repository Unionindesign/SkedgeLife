import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@skedgelife/types";

export type SkedgeLifeClient = SupabaseClient<Database>;
