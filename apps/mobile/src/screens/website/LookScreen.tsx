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
      <Text style={formStyles.hint}>Colors and fonts for your page. Each card is a small preview.</Text>
      <View style={styles.skinRow}>
        {Object.values(skins).map((skin) => {
          const selected = skin.id === profile.skin;
          const heading = skin.fonts.heading ? { fontFamily: skin.fonts.heading, fontWeight: "normal" as const } : null;
          const name = skin.fonts.accent ? { fontFamily: skin.fonts.accent, fontWeight: "normal" as const } : heading;
          return (
            // A miniature of the page: header, name, a section title and tags, footer.
            <Pressable
              key={skin.id}
              onPress={() => pickSkin(skin.id)}
              style={[styles.skinCard, selected && { borderColor: skin.colors.accent, borderWidth: 2 }]}
              accessibilityRole="radio"
              accessibilityLabel={`${skin.label} skin`}
              accessibilityState={{ selected }}
            >
              <View style={[styles.previewHeader, { backgroundColor: skin.colors.header }]} />
              <View style={[styles.previewBody, { backgroundColor: skin.colors.background }]}>
                <Text style={[styles.previewName, { color: skin.colors.headingText }, name]} numberOfLines={1}>
                  {skin.label}
                </Text>
                <View style={[styles.previewBand, { backgroundColor: skin.colors.band }]}>
                  <Text style={[styles.previewTitle, { color: skin.colors.accent }, heading]}>Classes</Text>
                  <View style={styles.previewTags}>
                    <View style={[styles.previewTag, { backgroundColor: skin.colors.accent }]} />
                    <View style={[styles.previewTag, styles.previewTagShort, { borderColor: skin.colors.accent }]} />
                  </View>
                </View>
              </View>
              <View style={[styles.previewFooter, { backgroundColor: skin.colors.footer }]} />
              {selected ? (
                <Text style={[styles.selectedBadge, { backgroundColor: skin.colors.accent }]}>Selected</Text>
              ) : null}
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
  skinCard: { width: "47%", borderRadius: 10, borderWidth: 1, borderColor: "#ddd", overflow: "hidden" },
  previewHeader: { height: 18 },
  previewBody: { paddingTop: 8 },
  previewName: { fontSize: 20, lineHeight: 30, textAlign: "center", paddingHorizontal: 8 },
  previewBand: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 8 },
  previewTitle: { fontSize: 15, fontWeight: "700" },
  previewTags: { flexDirection: "row", gap: 4, marginTop: 6 },
  previewTag: { width: 34, height: 10, borderRadius: 5 },
  previewTagShort: { width: 24, backgroundColor: "transparent", borderWidth: 1 },
  previewFooter: { height: 14 },
  selectedBadge: {
    position: "absolute",
    top: 3,
    right: 4,
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
});
