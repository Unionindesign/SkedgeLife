import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { updateProfile, type ProfileEdits, type ProfilePage } from "@skedgelife/data";
import { getSkin, skins } from "@skedgelife/skins";
import type { MainStackParamList } from "../navigation/RootNavigator";
import { useProfile } from "../data/ProfileProvider";
import ProfileStatus from "../components/ProfileStatus";
import TagEditor from "../components/TagEditor";
import { supabase } from "../lib/supabase";
import { errorMessage } from "../lib/errors";

// Limits match the check constraints on public.profiles.
const LIMITS = { displayName: 80, bioShort: 280, bioLong: 5000 };

type Props = NativeStackScreenProps<MainStackParamList, "EditProfile">;

export default function EditProfileScreen(props: Props) {
  const { state, reload } = useProfile();
  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;
  return <EditProfileForm {...props} profile={state.profile} onSaved={reload} />;
}

function toForm(p: ProfilePage) {
  return {
    display_name: p.display_name,
    bio_short: p.bio_short ?? "",
    bio_long: p.bio_long ?? "",
    interests: p.interests,
    teaches: p.teaches,
    specialties: p.specialties,
    certifications: p.certifications,
    contact_email: p.contact_email ?? "",
    contact_phone: p.contact_phone ?? "",
    instagram_handle: p.instagram_handle ?? "",
    skin: p.skin,
  };
}

type Form = ReturnType<typeof toForm>;

// Empty optional text is saved as null so the profile page hides it.
function toEdits(f: Form): ProfileEdits {
  const text = (s: string) => s.trim() || null;
  return {
    display_name: f.display_name.trim(),
    bio_short: text(f.bio_short),
    bio_long: text(f.bio_long),
    interests: f.interests,
    teaches: f.teaches,
    specialties: f.specialties,
    certifications: f.certifications,
    contact_email: text(f.contact_email),
    contact_phone: text(f.contact_phone),
    instagram_handle: text(f.instagram_handle),
    skin: f.skin,
  };
}

function EditProfileForm({ navigation, profile, onSaved }: Props & { profile: ProfilePage; onSaved: () => void }) {
  const [initial] = useState(() => toForm(profile));
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const accent = getSkin(form.skin).colors.accent;

  const changed = JSON.stringify(form) !== JSON.stringify(initial);
  const valid =
    form.display_name.trim().length > 0 &&
    form.display_name.length <= LIMITS.displayName &&
    form.bio_short.length <= LIMITS.bioShort &&
    form.bio_long.length <= LIMITS.bioLong;
  const canSave = changed && valid && !saving;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile(supabase, profile.id, toEdits(form));
      onSaved();
      navigation.goBack();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Field label="Name" count={form.display_name.length} max={LIMITS.displayName}>
        <TextInput style={styles.input} value={form.display_name} onChangeText={(v) => set("display_name", v)} />
      </Field>

      <Field label="Short bio" hint="One or two lines under your name." count={form.bio_short.length} max={LIMITS.bioShort}>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={form.bio_short}
          onChangeText={(v) => set("bio_short", v)}
          multiline
        />
      </Field>

      <Field label="About you" count={form.bio_long.length} max={LIMITS.bioLong}>
        <TextInput
          style={[styles.input, styles.multilineTall]}
          value={form.bio_long}
          onChangeText={(v) => set("bio_long", v)}
          multiline
        />
      </Field>

      <Field label="Interests">
        <TagEditor tags={form.interests} onChange={(v) => set("interests", v)} placeholder="e.g. Yin yoga" accentColor={accent} />
      </Field>

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>I teach classes or sessions</Text>
          <Text style={styles.hint}>Shows your specialties, certifications, and services on your page.</Text>
        </View>
        <Switch value={form.teaches} onValueChange={(v) => set("teaches", v)} />
      </View>

      {form.teaches ? (
        <>
          <Field label="Specialties">
            <TagEditor tags={form.specialties} onChange={(v) => set("specialties", v)} placeholder="e.g. Vinyasa" accentColor={accent} />
          </Field>
          <Field label="Certifications">
            <TagEditor
              tags={form.certifications}
              onChange={(v) => set("certifications", v)}
              placeholder="e.g. RYT-200"
              accentColor={accent}
            />
          </Field>
        </>
      ) : null}

      <Text style={styles.sectionHeading}>Contact</Text>
      <Field label="Email">
        <TextInput
          style={styles.input}
          value={form.contact_email}
          onChangeText={(v) => set("contact_email", v)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </Field>
      <Field label="Phone">
        <TextInput style={styles.input} value={form.contact_phone} onChangeText={(v) => set("contact_phone", v)} keyboardType="phone-pad" />
      </Field>
      <Field label="Instagram">
        <TextInput
          style={styles.input}
          value={form.instagram_handle}
          onChangeText={(v) => set("instagram_handle", v)}
          autoCapitalize="none"
          placeholder="@yourhandle"
        />
      </Field>

      <Text style={styles.sectionHeading}>Look</Text>
      <View style={styles.skinRow}>
        {Object.values(skins).map((skin) => {
          const selected = skin.id === form.skin;
          return (
            <Pressable
              key={skin.id}
              onPress={() => set("skin", skin.id)}
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

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.saveButton, !canSave && styles.disabled]} disabled={!canSave} onPress={save}>
        <Text style={styles.saveText}>{saving ? "Saving…" : "Save"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  hint,
  count,
  max,
  children,
}: {
  label: string;
  hint?: string;
  count?: number;
  max?: number;
  children: React.ReactNode;
}) {
  const over = count !== undefined && max !== undefined && count > max;
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {max !== undefined ? <Text style={[styles.count, over && styles.over]}>{`${count}/${max}`}</Text> : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48, backgroundColor: "#fff" },
  field: { marginBottom: 18 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  label: { fontSize: 14, fontWeight: "600", color: "#333" },
  hint: { fontSize: 12, color: "#777", marginBottom: 6 },
  count: { fontSize: 12, color: "#999" },
  over: { color: "#b3261e", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  multiline: { minHeight: 64, textAlignVertical: "top" },
  multilineTall: { minHeight: 140, textAlignVertical: "top" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  sectionHeading: { fontSize: 18, fontWeight: "700", marginTop: 8, marginBottom: 12, color: "#2f2f2f" },
  skinRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  skinCard: { width: 140, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#ddd" },
  swatches: { flexDirection: "row", gap: 4, marginBottom: 8 },
  swatch: { width: 32, height: 32, borderRadius: 6 },
  skinLabel: { fontSize: 14, fontWeight: "600" },
  error: { color: "#b3261e", fontSize: 14, marginTop: 16 },
  saveButton: { marginTop: 24, backgroundColor: "#2f2f2f", borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.4 },
});
