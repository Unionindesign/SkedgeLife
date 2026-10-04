import type { SkedgeLifeClient } from "./client";

export const PROFILE_MEDIA_BUCKET = "profile-media";

// Matches public.gallery_limit() in the profile_media_and_limits migration.
export const GALLERY_LIMITS = { free: 3, paid: 30 } as const;

export function galleryLimit(plan: string) {
  return plan === "paid" ? GALLERY_LIMITS.paid : GALLERY_LIMITS.free;
}

// Photo columns store a storage path (<user id>/<file>), not a full URL, so
// rows survive a change of project URL or a move to a CDN.
export function isStoragePath(path: string) {
  return /^[0-9a-f-]{36}\//.test(path);
}

// Full URLs pass through; storage paths become public URLs. Anything else
// (such as the mobile app's bundled seed images) returns null.
export function imageUrl(client: SkedgeLifeClient, path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  if (!isStoragePath(path)) return null;
  return client.storage.from(PROFILE_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

// Uploads an already-compressed image into the user's folder and returns its path.
export async function uploadProfileImage(
  client: SkedgeLifeClient,
  userId: string,
  bytes: ArrayBuffer,
  contentType: "image/jpeg" | "image/png" | "image/webp",
) {
  const ext = contentType.split("/")[1].replace("jpeg", "jpg");
  // Hermes (React Native) has no crypto.randomUUID; this only needs to be unique within one user's folder.
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const path = `${userId}/${id}.${ext}`;
  const { error } = await client.storage.from(PROFILE_MEDIA_BUCKET).upload(path, bytes, { contentType });
  if (error) throw error;
  return path;
}

// Deletes a file the user uploaded. Seed images and outside URLs are left
// alone. Failures are ignored: a leftover file wastes a little storage but
// shouldn't block the edit the user made.
export async function removeProfileImage(client: SkedgeLifeClient, path: string | null | undefined) {
  if (!path || !isStoragePath(path)) return;
  await client.storage.from(PROFILE_MEDIA_BUCKET).remove([path]);
}

export async function addGalleryImage(client: SkedgeLifeClient, profileId: string, path: string, sortOrder: number) {
  const { error } = await client
    .from("gallery_images")
    .insert({ profile_id: profileId, url: path, sort_order: sortOrder });
  if (error) {
    // The limit trigger refused it; don't leave the uploaded file behind.
    await removeProfileImage(client, path);
    throw error;
  }
}

export async function updateGalleryCaption(client: SkedgeLifeClient, id: string, caption: string | null) {
  const { error } = await client.from("gallery_images").update({ caption }).eq("id", id);
  if (error) throw error;
}

export async function deleteGalleryImage(client: SkedgeLifeClient, id: string, path: string) {
  const { error } = await client.from("gallery_images").delete().eq("id", id);
  if (error) throw error;
  await removeProfileImage(client, path);
}
