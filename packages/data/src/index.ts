import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@skedgelife/types";

export type SkedgeLifeClient = SupabaseClient<Database>;

const PROFILE_PAGE_SELECT = `
  *,
  schedule_entries (*, schedule_times (*)),
  service_modalities (*),
  private_session_types (*),
  testimonials (*),
  gallery_images (*)
` as const;

// Everything shown on a profile page, in one request. Returns null when no
// profile has this handle.
export async function getProfilePage(client: SkedgeLifeClient, handle: string) {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_PAGE_SELECT)
    .eq("handle", handle)
    .order("sort_order", { referencedTable: "schedule_entries" })
    .order("sort_order", { referencedTable: "schedule_entries.schedule_times" })
    .order("sort_order", { referencedTable: "service_modalities" })
    .order("sort_order", { referencedTable: "private_session_types" })
    .order("sort_order", { referencedTable: "testimonials" })
    .order("sort_order", { referencedTable: "gallery_images" })
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type ProfilePage = NonNullable<Awaited<ReturnType<typeof getProfilePage>>>;
