import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  accentColor: string;
};

// Type a tag and press return (or Add) to add it; tap × to remove one.
export default function TagEditor({ tags, onChange, placeholder, accentColor }: Props) {
  const [draft, setDraft] = useState("");
  const trimmed = draft.trim();
  const isDuplicate = tags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
  const canAdd = trimmed.length > 0 && !isDuplicate && tags.length < MAX_TAGS;

  const add = () => {
    if (!canAdd) return;
    onChange([...tags, trimmed]);
    setDraft("");
  };

  return (
    <View>
      {tags.length > 0 ? (
        <View style={styles.tagRow}>
          {tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: accentColor }]}>
              <Text style={styles.tagText}>{tag}</Text>
              <Pressable
                onPress={() => onChange(tags.filter((t) => t !== tag))}
                hitSlop={8}
                accessibilityLabel={`Remove ${tag}`}
              >
                <Text style={styles.remove}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={tags.length >= MAX_TAGS ? `Up to ${MAX_TAGS}` : placeholder}
          maxLength={MAX_TAG_LENGTH}
          editable={tags.length < MAX_TAGS}
          onSubmitEditing={add}
          blurOnSubmit={false}
          returnKeyType="done"
        />
        <Pressable onPress={add} disabled={!canAdd} style={[styles.addButton, !canAdd && styles.disabled]}>
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>
      {isDuplicate && trimmed ? <Text style={styles.hint}>Already added.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  tag: { flexDirection: "row", alignItems: "center", paddingLeft: 10, paddingRight: 8, paddingVertical: 6, borderRadius: 16 },
  tagText: { color: "#fff", fontSize: 13 },
  remove: { color: "#fff", fontSize: 16, marginLeft: 6, lineHeight: 18 },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  addButton: { justifyContent: "center", paddingHorizontal: 16, borderRadius: 8, backgroundColor: "#2f2f2f" },
  addText: { color: "#fff", fontWeight: "600" },
  disabled: { opacity: 0.4 },
  hint: { fontSize: 12, color: "#777", marginTop: 4 },
});
