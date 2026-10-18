import { imageUrl, type SkedgeLifeClient } from "@skedgelife/data";

// Uploaded photos are storage paths; the local seed's photos are copies in
// public/instructor-seed (the app bundles the same files).
export function webImage(client: SkedgeLifeClient, path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("instructor-seed/")) return `/${path}`;
  return imageUrl(client, path);
}
