import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { updateProfile } from "@skedgelife/data";
import { ACCENT_PRESETS, getSkin, isReadableAccent, normalizeHex, skins } from "@skedgelife/skins";
import { useProfile } from "../../data/ProfileProvider";
import ProfileStatus from "../../components/ProfileStatus";
import ImageField from "../../components/ImageField";
import { formStyles } from "../../components/Field";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/errors";

// Logo, accent color, and skin: how the website looks. All save right away.
export default function LookScreen() {
  const { state, reload } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [customHex, setCustomHex] = useState("");
  const [hexError, setHexError] = useState<string | null>(null);
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

  const pickAccent = async (accent_color: string | null) => {
    if (accent_color === profile.accent_color) return;
    setError(null);
    try {
      await updateProfile(supabase, profile.id, { accent_color });
      reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const applyCustom = () => {
    const hex = normalizeHex(customHex);
    if (!hex) return setHexError("Enter a color like #7a3e9d.");
    if (!isReadableAccent(hex)) return setHexError("Too light to read on white. Try a darker shade.");
    setHexError(null);
    setCustomHex("");
    pickAccent(hex);
  };

  const skinAccent = getSkin(profile.skin).colors.accent;
  const isPreset = ACCENT_PRESETS.some((p) => p.hex === profile.accent_color);
  const accentChoices = [
    { label: "Skin's color", hex: skinAccent, value: null },
    ...ACCENT_PRESETS.map((p) => ({ ...p, value: p.hex })),
    // A custom color, once saved, shows as its own swatch.
    ...(profile.accent_color && !isPreset
      ? [{ label: "Your color", hex: profile.accent_color, value: profile.accent_color }]
      : []),
  ];

  return (
    <ScrollView contentContainerStyle={formStyles.container} keyboardShouldPersistTaps="handled">
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

      <Text style={[formStyles.sectionHeading, styles.spaced]}>Accent color</Text>
      <Text style={formStyles.hint}>Titles, links, buttons, and the footer. Every color here is easy to read.</Text>
      <View style={styles.accentRow} accessibilityRole="radiogroup">
        {accentChoices.map((choice) => {
          const selected = choice.value === (profile.accent_color ?? null);
          return (
            <Pressable
              key={choice.label}
              onPress={() => pickAccent(choice.value)}
              style={styles.accentChoice}
              accessibilityRole="radio"
              accessibilityLabel={choice.label}
              accessibilityState={{ selected }}
            >
              <View style={[styles.accentRing, selected && { borderColor: choice.hex }]}>
                <View style={[styles.accentDot, { backgroundColor: choice.hex }]} />
              </View>
              <Text style={styles.accentLabel} numberOfLines={1}>
                {choice.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.customRow}>
        <TextInput
          value={customHex}
          onChangeText={(text) => {
            setCustomHex(text);
            setHexError(null);
          }}
          onSubmitEditing={applyCustom}
          placeholder="Custom, e.g. #7a3e9d"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={7}
          style={[formStyles.input, styles.customInput]}
          accessibilityLabel="Custom color, as a hex code"
        />
        <Pressable onPress={applyCustom} style={styles.customButton} accessibilityRole="button">
          <Text style={styles.customButtonText}>Use</Text>
        </Pressable>
      </View>
      {hexError ? <Text style={styles.hexError}>{hexError}</Text> : null}

      <Text style={[formStyles.sectionHeading, styles.spaced]}>Skin</Text>
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
  accentRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
  accentChoice: { width: 64, alignItems: "center", paddingVertical: 4 },
  accentRing: { padding: 3, borderRadius: 22, borderWidth: 2, borderColor: "transparent" },
  accentDot: { width: 32, height: 32, borderRadius: 16 },
  accentLabel: { fontSize: 11, color: "#555", marginTop: 2 },
  customRow: { flexDirection: "row", gap: 8, marginTop: 10, alignItems: "center" },
  customInput: { flex: 1 },
  customButton: { borderWidth: 1, borderColor: "#2f2f2f", borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
  customButtonText: { fontSize: 16, fontWeight: "600", color: "#2f2f2f" },
  hexError: { color: "#b3261e", fontSize: 12, marginTop: 4 },
  spaced: { marginTop: 24 },
});
