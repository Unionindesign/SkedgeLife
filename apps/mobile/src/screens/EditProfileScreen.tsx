import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { updateProfile, type ProfileEdits, type ProfilePage } from "@skedgelife/data";
import { getSkin } from "@skedgelife/skins";
import type { MainStackParamList } from "../navigation/RootNavigator";
import { useProfile } from "../data/ProfileProvider";
import ProfileStatus from "../components/ProfileStatus";
import TagEditor from "../components/TagEditor";
import Field, { formStyles } from "../components/Field";
import ImageField from "../components/ImageField";
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
  };
}

function EditProfileForm({ navigation, profile, onSaved }: Props & { profile: ProfilePage; onSaved: () => void }) {
  const [initial] = useState(() => toForm(profile));
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const accent = getSkin(profile.skin).colors.accent;

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
    <ScrollView contentContainerStyle={formStyles.container} keyboardShouldPersistTaps="handled">
      <ImageField
        userId={profile.id}
        kind="avatar"
        path={profile.avatar_url}
        onSave={async (avatar_url) => {
          await updateProfile(supabase, profile.id, { avatar_url });
          onSaved();
        }}
      />
      <Text style={styles.photoHint}>Photo changes save right away.</Text>

      <Field label="Name" count={form.display_name.length} max={LIMITS.displayName}>
        <TextInput style={formStyles.input} value={form.display_name} onChangeText={(v) => set("display_name", v)} />
      </Field>

      <Field label="Short bio" hint="One or two lines under your name." count={form.bio_short.length} max={LIMITS.bioShort}>
        <TextInput
          style={[formStyles.input, formStyles.multiline]}
          value={form.bio_short}
          onChangeText={(v) => set("bio_short", v)}
          multiline
        />
      </Field>

      <Field label="About you" count={form.bio_long.length} max={LIMITS.bioLong}>
        <TextInput
          style={[formStyles.input, formStyles.multilineTall]}
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
          <Text style={formStyles.label}>I teach classes or sessions</Text>
          <Text style={formStyles.hint}>Shows your specialties, certifications, and services on your page.</Text>
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

      <Text style={formStyles.sectionHeading}>Contact</Text>
      <Field label="Email">
        <TextInput
          style={formStyles.input}
          value={form.contact_email}
          onChangeText={(v) => set("contact_email", v)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </Field>
      <Field label="Phone">
        <TextInput style={formStyles.input} value={form.contact_phone} onChangeText={(v) => set("contact_phone", v)} keyboardType="phone-pad" />
      </Field>
      <Field label="Instagram">
        <TextInput
          style={formStyles.input}
          value={form.instagram_handle}
          onChangeText={(v) => set("instagram_handle", v)}
          autoCapitalize="none"
          placeholder="@yourhandle"
        />
      </Field>

      {error ? <Text style={formStyles.error}>{error}</Text> : null}
      <Pressable style={[formStyles.primaryButton, !canSave && formStyles.disabled]} disabled={!canSave} onPress={save}>
        <Text style={formStyles.primaryText}>{saving ? "Saving…" : "Save"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  photoHint: { fontSize: 12, color: "#777", textAlign: "center", marginTop: -10, marginBottom: 20 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
});
