import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { updateProfile } from "@skedgelife/data";
import { skins } from "@skedgelife/skins";
import { useProfile } from "../../data/ProfileProvider";
import ProfileStatus from "../../components/ProfileStatus";
import ImageField from "../../components/ImageField";
import { formStyles } from "../../components/Field";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/errors";

// Logo and skin: how the website looks. Both save right away.
export default function LookScreen() {
  const { state, reload } = useProfile();
  const [error, setError] = useState<string | null>(null);
  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;
  const profile = state.profile;

  const pickSkin = async (skin: string) => {
    if (skin === profile.skin) return;
    setError(null);
    try {
      await updateProfile(supabase, profile.id, { skin });
      reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <ScrollView contentContainerStyle={formStyles.container}>
      <Text style={formStyles.sectionHeading}>Logo</Text>
      <ImageField
        userId={profile.id}
        kind="logo"
        path={profile.logo_url}
        onSave={async (logo_url) => {
          await updateProfile(supabase, profile.id, { logo_url });
          reload();
        }}
      />

      <Text style={formStyles.sectionHeading}>Skin</Text>
      <Text style={formStyles.hint}>Colors and fonts for your page.</Text>
      <View style={styles.skinRow}>
        {Object.values(skins).map((skin) => {
          const selected = skin.id === profile.skin;
          return (
            <Pressable
              key={skin.id}
              onPress={() => pickSkin(skin.id)}
              style={[styles.skinCard, selected && { borderColor: skin.colors.accent, borderWidth: 2 }]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={styles.swatches}>
                {[skin.colors.header, skin.colors.accent, skin.colors.cardBackground].map((c) => (
                  <View key={c} style={[styles.swatch, { backgroundColor: c }]} />
                ))}
              </View>
              <Text style={styles.skinLabel}>{skin.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={formStyles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  skinRow: { flexDirection: "row", gap: 12, flexWrap: "wrap", marginTop: 6 },
  skinCard: { width: 140, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#ddd" },
  swatches: { flexDirection: "row", gap: 4, marginBottom: 8 },
  swatch: { width: 32, height: 32, borderRadius: 6 },
  skinLabel: { fontSize: 14, fontWeight: "600" },
});
