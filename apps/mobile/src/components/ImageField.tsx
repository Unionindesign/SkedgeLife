import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { removeProfileImage } from "@skedgelife/data";
import { imageSource } from "../lib/images";
import { pickAndUploadImage, type ImageKind } from "../lib/pickImage";
import { supabase } from "../lib/supabase";
import { errorMessage } from "../lib/errors";

type Props = {
  userId: string;
  kind: "avatar" | "logo";
  path: string | null;
  // Saves the new path (or null to remove) to the profile.
  onSave: (path: string | null) => Promise<void>;
};

// A profile photo or logo with Change and Remove. Changes save right away,
// and the replaced file is deleted once the new one is saved.
export default function ImageField({ userId, kind, path, onSave }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const source = imageSource(path);
  const isAvatar = kind === "avatar";

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const change = () =>
    run(async () => {
      const newPath = await pickAndUploadImage(userId, kind as ImageKind);
      if (!newPath) return;
      try {
        await onSave(newPath);
      } catch (err) {
        await removeProfileImage(supabase, newPath);
        throw err;
      }
      await removeProfileImage(supabase, path);
    });

  const remove = () =>
    run(async () => {
      await onSave(null);
      await removeProfileImage(supabase, path);
    });

  return (
    <View style={styles.container}>
      <View style={[styles.frame, isAvatar ? styles.avatar : styles.logo]}>
        {source ? (
          <Image source={source} style={styles.image} resizeMode={isAvatar ? "cover" : "contain"} />
        ) : (
          <Text style={styles.placeholder}>{isAvatar ? "No photo" : "No logo"}</Text>
        )}
        {busy ? (
          <View style={styles.busy}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Pressable onPress={change} disabled={busy} style={[styles.button, busy && styles.disabled]}>
          <Text style={styles.buttonText}>{source ? "Change" : isAvatar ? "Add photo" : "Add logo"}</Text>
        </Pressable>
        {path ? (
          <Pressable onPress={remove} disabled={busy} style={[styles.button, busy && styles.disabled]}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 20 },
  frame: { backgroundColor: "#eee", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  logo: { width: 240, height: 90, borderRadius: 8 },
  image: { width: "100%", height: "100%" },
  placeholder: { color: "#888", fontSize: 13 },
  busy: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", gap: 16, marginTop: 10 },
  button: { paddingHorizontal: 8, paddingVertical: 4 },
  buttonText: { fontSize: 15, fontWeight: "600", color: "#2f2f2f" },
  removeText: { fontSize: 15, color: "#b3261e" },
  disabled: { opacity: 0.4 },
  error: { color: "#b3261e", fontSize: 13, marginTop: 6, textAlign: "center" },
});
