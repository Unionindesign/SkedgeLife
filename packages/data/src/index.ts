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

export type ProfileLookup = { handle: string } | { id: string };

// Everything shown on a profile page, in one request. Returns null when no
// profile matches.
export async function getProfilePage(client: SkedgeLifeClient, lookup: ProfileLookup) {
  const base = client.from("profiles").select(PROFILE_PAGE_SELECT);
  const filtered = "id" in lookup ? base.eq("id", lookup.id) : base.eq("handle", lookup.handle);
  const { data, error } = await filtered
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

// The profile columns a user may edit; mirrors the column grants in the
// profiles migration (plan and timestamps are not user-editable).
export type ProfileEdits = Pick<
  Database["public"]["Tables"]["profiles"]["Update"],
  | "display_name"
  | "bio_short"
  | "bio_long"
  | "interests"
  | "teaches"
  | "specialties"
  | "certifications"
  | "contact_email"
  | "contact_phone"
  | "instagram_handle"
  | "skin"
>;

export async function updateProfile(client: SkedgeLifeClient, id: string, edits: ProfileEdits) {
  const { error } = await client.from("profiles").update(edits).eq("id", id);
  if (error) throw error;
}

// Checks format, reserved words, and whether the handle is taken.
export async function isHandleAvailable(client: SkedgeLifeClient, handle: string) {
  const { data, error } = await client.rpc("is_handle_available", { h: handle });
  if (error) throw error;
  return data;
}
