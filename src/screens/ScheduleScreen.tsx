import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from "react-native";
import { seedSchedule, seedInstructor } from "../data/seedInstructor";
import { skins } from "../theme/skins";

export default function ScheduleScreen() {
  const skin = skins[seedInstructor.skin];

  if (seedSchedule.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No public classes available at this time.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {seedSchedule.map((entry) => (
        <View key={entry.id} style={[styles.card, { borderColor: skin.colors.accent }]}>
          <Text style={styles.venueName}>{entry.venueName}</Text>
          {entry.times.map((t, i) => (
            <Text key={i} style={styles.timeLine}>
              <Text style={styles.day}>{t.day}: </Text>
              {t.label}
            </Text>
          ))}
          {entry.bookingUrl ? (
            <Pressable onPress={() => Linking.openURL(entry.bookingUrl!)}>
              <Text style={[styles.link, { color: skin.colors.accent }]}>View studio →</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: { borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 16 },
  venueName: { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  timeLine: { fontSize: 14, marginBottom: 4, color: "#333" },
  day: { fontWeight: "600" },
  link: { marginTop: 8, fontWeight: "600" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  emptyText: { fontSize: 15, color: "#666", textAlign: "center" },
});
