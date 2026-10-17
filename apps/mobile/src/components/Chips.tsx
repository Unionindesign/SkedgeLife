import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Option<T> = { value: T; label: string };

// A row of pill buttons: pick one (`selected` is a value) or several (an array).
export default function Chips<T extends string | number>({
  options,
  selected,
  onToggle,
  accentColor = "#2f2f2f",
}: {
  options: Option<T>[];
  selected: T | T[];
  onToggle: (value: T) => void;
  accentColor?: string;
}) {
  const isSelected = (v: T) => (Array.isArray(selected) ? selected.includes(v) : selected === v);
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const on = isSelected(o.value);
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onToggle(o.value)}
            style={[styles.chip, on && { backgroundColor: accentColor, borderColor: accentColor }]}
            accessibilityRole={Array.isArray(selected) ? "checkbox" : "radio"}
            accessibilityState={Array.isArray(selected) ? { checked: on } : { selected: on }}
          >
            <Text style={[styles.label, on && styles.labelOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#ccc", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  label: { fontSize: 14, color: "#2f2f2f" },
  labelOn: { color: "#fff", fontWeight: "600" },
});
