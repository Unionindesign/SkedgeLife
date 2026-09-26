import type { ImageSourcePropType } from "react-native";

// Seed rows point at images bundled with the app until photos move to
// Supabase Storage (#37). Full URLs load from the network.
const bundled: Record<string, ImageSourcePropType> = {
  "instructor-seed/logo-MichelleRose.png": require("../../assets/instructor-seed/logo-MichelleRose.png"),
  "instructor-seed/bio-sqSmile.png": require("../../assets/instructor-seed/bio-sqSmile.png"),
  "instructor-seed/gal-headStand.png": require("../../assets/instructor-seed/gal-headStand.png"),
  "instructor-seed/CamelGroup.jpeg": require("../../assets/instructor-seed/CamelGroup.jpeg"),
  "instructor-seed/gal-treePool.png": require("../../assets/instructor-seed/gal-treePool.png"),
};

export function imageSource(url: string | null | undefined): ImageSourcePropType | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return { uri: url };
  return bundled[url];
}
