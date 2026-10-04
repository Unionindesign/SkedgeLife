import type { Database } from "@skedgelife/types";
import type { SkedgeLifeClient } from "./client";

type Tables = Database["public"]["Tables"];

// supabase-js can't type queries on a table chosen at run time. Every table
// here has id, profile_id, and sort_order, so query it as one of them; the
// public functions check the row shapes per table instead.
function table(client: SkedgeLifeClient, name: ContentTable | "gallery_images") {
  return client.from(name as "testimonials");
}

// Page content edited as an ordered list: services, privates, testimonials.
export type ContentTable = "service_modalities" | "private_session_types" | "testimonials";
export type ContentFields<T extends ContentTable> = Omit<
  Tables[T]["Insert"],
  "id" | "profile_id" | "sort_order" | "created_at"
>;

// New items go to the end of the list.
export async function addContentItem<T extends ContentTable>(
  client: SkedgeLifeClient,
  name: T,
  profileId: string,
  fields: ContentFields<T>,
  sortOrder: number,
) {
  const row = { ...fields, profile_id: profileId, sort_order: sortOrder } as Tables[T]["Insert"];
  const { error } = await table(client, name).insert(row as never);
  if (error) throw error;
}

export async function updateContentItem<T extends ContentTable>(
  client: SkedgeLifeClient,
  name: T,
  id: string,
  fields: ContentFields<T>,
) {
  const { error } = await table(client, name).update(fields as never).eq("id", id);
  if (error) throw error;
}

export async function deleteContentItem(client: SkedgeLifeClient, name: ContentTable | "gallery_images", id: string) {
  const { error } = await table(client, name).delete().eq("id", id);
  if (error) throw error;
}

// Saves a new order: each id's sort_order becomes its position in the list.
export async function reorderItems(
  client: SkedgeLifeClient,
  name: ContentTable | "gallery_images",
  orderedIds: string[],
) {
  const results = await Promise.all(
    orderedIds.map((id, index) => table(client, name).update({ sort_order: index }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
