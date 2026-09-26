import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center", backgroundColor: "#fff" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  hint: { fontSize: 12, color: "#777", marginTop: 4 },
  ok: { fontSize: 12, color: "#0a7d3b", marginTop: 4 },
  bad: { fontSize: 12, color: "#b3261e", marginTop: 4 },
  error: { fontSize: 14, color: "#b3261e", marginTop: 16 },
  notice: { fontSize: 14, color: "#333", marginTop: 16 },
  button: { marginTop: 24, backgroundColor: "#2f2f2f", borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { marginTop: 18, textAlign: "center", color: "#2f2f2f", textDecorationLine: "underline" },
});
