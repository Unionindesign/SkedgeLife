import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { seedPoses } from "../data/seedPoses";
import { SequenceItem, Pose } from "@skedgelife/types";
import { seedInstructor } from "../data/seedInstructor";

// Minimal working sequence builder: drag-reorder a list of poses, edit
// duration/side inline, attach a quote + playlist link at the sequence
// level, and export to PDF (reusing expo-print rather than building a
// bespoke PDF pipeline, per the ideation doc's suggestion to reuse
// receipt/invoice PDF infra for sequence cards).

const poseById: Record<string, Pose> = Object.fromEntries(seedPoses.map((p) => [p.id, p]));

function buildInitialItems(): SequenceItem[] {
  return seedPoses.slice(0, 6).map((pose, index) => ({
    id: `item-${pose.id}`,
    sequenceId: "draft-sequence",
    poseId: pose.id,
    orderIndex: index,
    durationSec: pose.defaultDurationSec,
    side: "N/A",
  }));
}

export default function SequenceBuilderScreen() {
  const [items, setItems] = useState<SequenceItem[]>(buildInitialItems());
  const [title, setTitle] = useState("Untitled Sequence");
  const [quote, setQuote] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");

  const updateDuration = (id: string, deltaSec: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, durationSec: Math.max(5, it.durationSec + deltaSec) } : it))
    );
  };

  const cycleSide = (id: string) => {
    const order: SequenceItem["side"][] = ["N/A", "L", "R"];
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const next = order[(order.indexOf(it.side) + 1) % order.length];
        return { ...it, side: next };
      })
    );
  };

  const totalDurationSec = items.reduce((sum, it) => sum + it.durationSec, 0);

  const exportPdf = async () => {
    const rowsHtml = items
      .map((it, i) => {
        const pose = poseById[it.poseId];
        return `<tr>
          <td>${i + 1}</td>
          <td>${pose?.nameEn ?? "?"}${pose?.nameSanskrit ? ` (${pose.nameSanskrit})` : ""}</td>
          <td>${it.durationSec}s</td>
          <td>${it.side}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <html>
        <body style="font-family: -apple-system, sans-serif; padding: 24px;">
          <h1>${title}</h1>
          <p><em>${seedInstructor.displayName}</em></p>
          ${quote ? `<p style="font-style: italic;">"${quote}"</p>` : ""}
          ${playlistUrl ? `<p>Playlist: ${playlistUrl}</p>` : ""}
          <table style="width: 100%; border-collapse: collapse;" border="1" cellpadding="6">
            <thead><tr><th>#</th><th>Pose</th><th>Duration</th><th>Side</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <p>Total: ${Math.round(totalDurationSec / 60)} min</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (err) {
      Alert.alert("Export failed", String(err));
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<SequenceItem>) => {
    const pose = poseById[item.poseId];
    return (
      <ScaleDecorator>
        <Pressable
          onLongPress={drag}
          disabled={isActive}
          style={[styles.row, isActive && styles.rowActive]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.poseName}>{pose?.nameEn ?? "Unknown pose"}</Text>
            {pose?.nameSanskrit ? <Text style={styles.poseSanskrit}>{pose.nameSanskrit}</Text> : null}
          </View>
          <Pressable onPress={() => updateDuration(item.id, -5)} style={styles.smallButton}>
            <Text>-5s</Text>
          </Pressable>
          <Text style={styles.duration}>{item.durationSec}s</Text>
          <Pressable onPress={() => updateDuration(item.id, 5)} style={styles.smallButton}>
            <Text>+5s</Text>
          </Pressable>
          <Pressable onPress={() => cycleSide(item.id)} style={styles.smallButton}>
            <Text>{item.side}</Text>
          </Pressable>
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TextInput style={styles.titleInput} value={title} onChangeText={setTitle} placeholder="Sequence title" />
        <TextInput
          style={styles.input}
          value={quote}
          onChangeText={setQuote}
          placeholder="Opening quote (optional)"
        />
        <TextInput
          style={styles.input}
          value={playlistUrl}
          onChangeText={setPlaylistUrl}
          placeholder="Spotify playlist URL (optional)"
          autoCapitalize="none"
        />
        <Text style={styles.totalText}>Total: {Math.round(totalDurationSec / 60)} min</Text>
      </View>

      <DraggableFlatList
        data={items}
        onDragEnd={({ data }) => setItems(data)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        containerStyle={{ flex: 1 }}
      />

      <Pressable style={styles.exportButton} onPress={exportPdf}>
        <Text style={styles.exportButtonText}>Export sequence card (PDF)</Text>
      </Pressable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, gap: 8 },
  titleInput: { fontSize: 20, fontWeight: "700", borderBottomWidth: 1, borderColor: "#ccc", paddingVertical: 6 },
  input: { fontSize: 14, borderBottomWidth: 1, borderColor: "#eee", paddingVertical: 6 },
  totalText: { fontSize: 13, color: "#666", marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
  },
  rowActive: { backgroundColor: "#e0f2f1" },
  poseName: { fontSize: 15, fontWeight: "600" },
  poseSanskrit: { fontSize: 12, color: "#777" },
  duration: { width: 40, textAlign: "center", fontSize: 13 },
  smallButton: { paddingHorizontal: 8, paddingVertical: 4, marginHorizontal: 2 },
  exportButton: {
    backgroundColor: "#00695c",
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  exportButtonText: { color: "#fff", fontWeight: "700" },
});
