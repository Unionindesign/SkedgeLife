import { StyleSheet } from "react-native";

// Shared by the Schedule tab's list and calendar views.
export const scheduleStyles = StyleSheet.create({
  dayHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2f2f2f",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  emptyText: { fontSize: 16, color: "#888", textAlign: "center" },
  errorDetail: { fontSize: 13, color: "#999", textAlign: "center", marginTop: 6 },
  outlineButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#2f2f2f",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  outlineText: { fontSize: 15, fontWeight: "600", color: "#2f2f2f" },
});
