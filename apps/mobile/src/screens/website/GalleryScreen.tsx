import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DraggableFlatList, { type RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import {
  addGalleryImage,
  deleteGalleryImage,
  galleryLimit,
  GALLERY_LIMITS,
  reorderItems,
  updateGalleryCaption,
  type ProfilePage,
} from "@skedgelife/data";
import { useProfile } from "../../data/ProfileProvider";
import ProfileStatus from "../../components/ProfileStatus";
import { imageSource } from "../../lib/images";
import { pickAndUploadImage } from "../../lib/pickImage";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/errors";
import { confirm } from "../../lib/confirm";

type GalleryImage = ProfilePage["gallery_images"][number];

const CAPTION_MAX = 200; // matches gallery_images_caption_length

export default function GalleryScreen() {
  const { state, reload } = useProfile();
  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;
  return <GalleryEditor profile={state.profile} reload={reload} />;
}

function GalleryEditor({ profile, reload }: { profile: ProfilePage; reload: () => void }) {
  const [images, setImages] = useState(profile.gallery_images);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setImages(profile.gallery_images), [profile.gallery_images]);

  const limit = galleryLimit(profile.plan);
  const atLimit = images.length >= limit;

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      reload();
    }
  };

  const add = () =>
    run(async () => {
      const path = await pickAndUploadImage(profile.id, "gallery");
      if (!path) return;
      const next = images.reduce((max, i) => Math.max(max, i.sort_order), -1) + 1;
      await addGalleryImage(supabase, profile.id, path, next);
    });

  const remove = async (image: GalleryImage) => {
    if (!(await confirm("Delete this photo?", "It's removed from your page and can't be recovered."))) return;
    await run(() => deleteGalleryImage(supabase, image.id, image.url));
  };

  const saveOrder = (next: GalleryImage[]) => {
    setImages(next);
    run(() => reorderItems(supabase, "gallery_images", next.map((i) => i.id)));
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<GalleryImage>) => (
    <ScaleDecorator>
      <View style={[styles.row, isActive && styles.rowActive]}>
        <Image source={imageSource(item.url)} style={styles.thumb} />
        <CaptionInput image={item} onError={setError} onSaved={reload} />
        <Pressable onPress={() => remove(item)} hitSlop={8} accessibilityLabel="Delete photo">
          <Ionicons name="trash-outline" size={22} color="#b3261e" />
        </Pressable>
        <Pressable onPressIn={drag} disabled={isActive} hitSlop={8} accessibilityLabel="Drag to reorder">
          <Ionicons name="reorder-three" size={26} color="#999" />
        </Pressable>
      </View>
    </ScaleDecorator>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <DraggableFlatList
        data={images}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => saveOrder(data)}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.count}>
              {images.length} of {limit} photos
            </Text>
            {atLimit && profile.plan !== "paid" ? (
              <Text style={styles.upgrade}>Upgrade to the paid plan for up to {GALLERY_LIMITS.paid} photos.</Text>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Add photos of your classes, your space, or your practice.</Text>}
        ListFooterComponent={
          <Pressable style={[styles.addButton, (atLimit || busy) && styles.disabled]} disabled={atLimit || busy} onPress={add}>
            {busy ? <ActivityIndicator color="#2f2f2f" /> : <Text style={styles.addText}>Add photo</Text>}
          </Pressable>
        }
      />
    </GestureHandlerRootView>
  );
}

// Saves when the field loses focus, if the caption changed.
function CaptionInput({
  image,
  onError,
  onSaved,
}: {
  image: GalleryImage;
  onError: (message: string) => void;
  onSaved: () => void;
}) {
  const [caption, setCaption] = useState(image.caption ?? "");
  const save = async () => {
    const value = caption.trim() || null;
    if (value === image.caption) return;
    try {
      await updateGalleryCaption(supabase, image.id, value);
      onSaved();
    } catch (err) {
      onError(errorMessage(err));
    }
  };
  return (
    <TextInput
      style={styles.caption}
      value={caption}
      onChangeText={setCaption}
      onBlur={save}
      onSubmitEditing={save}
      placeholder="Add a caption"
      maxLength={CAPTION_MAX}
      returnKeyType="done"
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  count: { fontSize: 14, color: "#555" },
  upgrade: { fontSize: 13, color: "#8a5a00", marginTop: 6 },
  error: { color: "#b3261e", fontSize: 14, marginTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  rowActive: { backgroundColor: "#f4f4f4" },
  thumb: { width: 64, height: 64, borderRadius: 6, backgroundColor: "#eee" },
  caption: { flex: 1, fontSize: 14, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ccc" },
  empty: { paddingHorizontal: 20, paddingVertical: 8, fontSize: 14, color: "#666" },
  addButton: { margin: 20, borderWidth: 1, borderColor: "#2f2f2f", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  addText: { fontSize: 15, fontWeight: "600", color: "#2f2f2f" },
  disabled: { opacity: 0.4 },
});
