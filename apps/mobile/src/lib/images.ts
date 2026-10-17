import type { ImageSourcePropType } from "react-native";
import { imageUrl } from "@skedgelife/data";
import { supabase } from "./supabase";

// Seed rows point at images bundled with the app. Uploaded photos are
// storage paths, and full URLs load from the network.
const bundled: Record<string, ImageSourcePropType> = {
  "instructor-seed/logo-MichelleRose.png": require("../../assets/instructor-seed/logo-MichelleRose.png"),
  "instructor-seed/bio-sqSmile.png": require("../../assets/instructor-seed/bio-sqSmile.png"),
  "instructor-seed/gal-headStand.png": require("../../assets/instructor-seed/gal-headStand.png"),
  "instructor-seed/CamelGroup.jpeg": require("../../assets/instructor-seed/CamelGroup.jpeg"),
  "instructor-seed/gal-treePool.png": require("../../assets/instructor-seed/gal-treePool.png"),
};

export function imageSource(path: string | null | undefined): ImageSourcePropType | undefined {
  if (!path) return undefined;
  if (bundled[path]) return bundled[path];
  const uri = imageUrl(supabase, path);
  return uri ? { uri } : undefined;
}
