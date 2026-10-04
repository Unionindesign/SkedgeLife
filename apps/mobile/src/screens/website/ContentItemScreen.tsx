import React, { useLayoutEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { addContentItem, deleteContentItem, updateContentItem, type ContentFields, type ContentTable } from "@skedgelife/data";
import type { MainStackParamList } from "../../navigation/RootNavigator";
import { useProfile } from "../../data/ProfileProvider";
import ProfileStatus from "../../components/ProfileStatus";
import Field, { formStyles } from "../../components/Field";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/errors";
import { confirm } from "../../lib/confirm";
import { CONTENT_KINDS } from "./contentKinds";

type Props = NativeStackScreenProps<MainStackParamList, "ContentItem">;

// New items go after the last one.
function nextSortOrder(items: { sort_order: number }[]) {
  return items.reduce((max, i) => Math.max(max, i.sort_order), -1) + 1;
}

// Add or edit one service, private session, or testimonial.
export default function ContentItemScreen({ navigation, route }: Props) {
  const { kind, id } = route.params;
  const config = CONTENT_KINDS[kind];
  const { state, reload } = useProfile();
  const existing = state.status === "ready" && id ? config.items(state.profile).find((i) => i.id === id) : undefined;

  const [initial] = useState(() =>
    Object.fromEntries(config.fields.map((f) => [f.key, existing ? String(existing[f.key] ?? "") : ""])),
  );
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: id ? `Edit ${config.singular}` : `Add ${config.singular}` });
  }, [navigation, config, id]);

  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;
  const profile = state.profile;

  const changed = JSON.stringify(form) !== JSON.stringify(initial);
  const valid = config.fields.every((f) => form[f.key].length <= f.max && (!f.required || form[f.key].trim().length > 0));
  const canSave = changed && valid && !saving;

  const run = async (task: () => Promise<void>) => {
    setSaving(true);
    setError(null);
    try {
      await task();
      reload();
      navigation.goBack();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  const save = () =>
    run(async () => {
      const fields = Object.fromEntries(
        config.fields.map((f) => {
          const value = form[f.key].trim();
          return [f.key, f.nullable && !value ? null : value];
        }),
      ) as ContentFields<ContentTable>;
      if (id) await updateContentItem(supabase, config.table, id, fields);
      else await addContentItem(supabase, config.table, profile.id, fields, nextSortOrder(config.items(profile)));
    });

  const remove = async () => {
    if (!id || !(await confirm(`Delete this ${config.singular}?`, "This can't be undone."))) return;
    await run(() => deleteContentItem(supabase, config.table, id));
  };

  return (
    <ScrollView contentContainerStyle={formStyles.container} keyboardShouldPersistTaps="handled">
      {config.fields.map((f) => (
        <Field key={f.key} label={f.label} count={form[f.key].length} max={f.max}>
          <TextInput
            style={[formStyles.input, f.multiline && formStyles.multilineTall]}
            value={form[f.key]}
            onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
            placeholder={f.placeholder}
            multiline={f.multiline}
          />
        </Field>
      ))}

      {error ? <Text style={formStyles.error}>{error}</Text> : null}
      <Pressable style={[formStyles.primaryButton, !canSave && formStyles.disabled]} disabled={!canSave} onPress={save}>
        <Text style={formStyles.primaryText}>{saving ? "Saving…" : "Save"}</Text>
      </Pressable>
      {id ? (
        <Pressable style={formStyles.secondaryButton} disabled={saving} onPress={remove}>
          <Text style={formStyles.dangerText}>Delete {config.singular}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
