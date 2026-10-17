import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { uploadProfileImage } from "@skedgelife/data";
import { supabase } from "./supabase";

export type ImageKind = "avatar" | "logo" | "gallery";

// Originals run 1-17 MB, and Supabase only transforms images on its paid
// plan, so images are resized and compressed on the phone before upload.
const SETTINGS: Record<ImageKind, { maxSide: number; square: boolean; format: SaveFormat }> = {
  avatar: { maxSide: 800, square: true, format: SaveFormat.JPEG },
  // PNG keeps logo transparency.
  logo: { maxSide: 800, square: false, format: SaveFormat.PNG },
  gallery: { maxSide: 1600, square: false, format: SaveFormat.JPEG },
};

type Source = "library" | "camera";

function chooseSource(): Promise<Source | null> {
  // No camera in the web build, and Alert buttons don't work there.
  if (Platform.OS === "web") return Promise.resolve("library");
  return new Promise((resolve) =>
    Alert.alert("Add a photo", undefined, [
      { text: "Take photo", onPress: () => resolve("camera") },
      { text: "Choose from library", onPress: () => resolve("library") },
      { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
    ]),
  );
}

// Lets the user pick or take a photo, compresses it, uploads it to their
// folder, and returns the storage path. Returns null if they cancel.
export async function pickAndUploadImage(userId: string, kind: ImageKind): Promise<string | null> {
  const settings = SETTINGS[kind];
  const source = await chooseSource();
  if (!source) return null;

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: settings.square,
    aspect: settings.square ? [1, 1] : undefined,
    quality: 1,
  };
  if (source === "camera") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error("Camera access is off. Turn it on in Settings to take a photo.");
  }
  const result =
    source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > settings.maxSide) {
    context.resize(asset.width >= asset.height ? { width: settings.maxSide } : { height: settings.maxSide });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress: 0.8, format: settings.format });

  const bytes = await fetch(saved.uri).then((res) => res.arrayBuffer());
  const contentType = settings.format === SaveFormat.PNG ? "image/png" : "image/jpeg";
  return uploadProfileImage(supabase, userId, bytes, contentType);
}
