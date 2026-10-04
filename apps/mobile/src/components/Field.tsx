import React from "react";
import { StyleSheet, Text, View } from "react-native";

// A labelled form field with an optional hint and character counter.
export default function Field({
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
        <Text style={formStyles.label}>{label}</Text>
        {max !== undefined ? <Text style={[styles.count, over && styles.over]}>{`${count}/${max}`}</Text> : null}
      </View>
      {hint ? <Text style={formStyles.hint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 18 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  count: { fontSize: 12, color: "#999" },
  over: { color: "#b3261e", fontWeight: "600" },
});

// Shared by the editing screens.
export const formStyles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingBottom: 48, backgroundColor: "#fff" },
  label: { fontSize: 14, fontWeight: "600", color: "#333" },
  hint: { fontSize: 12, color: "#777", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  multiline: { minHeight: 64, textAlignVertical: "top" },
  multilineTall: { minHeight: 140, textAlignVertical: "top" },
  sectionHeading: { fontSize: 18, fontWeight: "700", marginTop: 8, marginBottom: 12, color: "#2f2f2f" },
  error: { color: "#b3261e", fontSize: 14, marginTop: 16 },
  primaryButton: { marginTop: 24, backgroundColor: "#2f2f2f", borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryButton: { marginTop: 12, borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  dangerText: { color: "#b3261e", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.4 },
});
