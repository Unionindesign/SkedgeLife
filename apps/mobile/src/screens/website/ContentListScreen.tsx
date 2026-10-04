import React, { useEffect, useLayoutEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import DraggableFlatList, { type RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { reorderItems } from "@skedgelife/data";
import type { MainStackParamList } from "../../navigation/RootNavigator";
import { useProfile } from "../../data/ProfileProvider";
import ProfileStatus from "../../components/ProfileStatus";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/errors";
import { CONTENT_KINDS, type ContentItem } from "./contentKinds";

type Props = NativeStackScreenProps<MainStackParamList, "ContentList">;

// Services, private sessions, or testimonials: tap to edit, hold the handle to reorder.
export default function ContentListScreen({ navigation, route }: Props) {
  const { kind } = route.params;
  const config = CONTENT_KINDS[kind];
  const { state, reload } = useProfile();
  const profileItems = state.status === "ready" ? config.items(state.profile) : null;
  const [items, setItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Follow the saved list whenever the profile reloads.
  useEffect(() => {
    if (profileItems) setItems(profileItems);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    navigation.setOptions({
      title: config.title,
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("ContentItem", { kind })} hitSlop={8} accessibilityLabel={`Add ${config.singular}`}>
          <Ionicons name="add" size={26} color="#2f2f2f" />
        </Pressable>
      ),
    });
  }, [navigation, config, kind]);

  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;

  const saveOrder = async (next: ContentItem[]) => {
    setItems(next);
    setError(null);
    try {
      await reorderItems(supabase, config.table, next.map((i) => i.id));
    } catch (err) {
      setError(errorMessage(err));
    }
    reload();
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ContentItem>) => (
    <ScaleDecorator>
      <View style={[styles.row, isActive && styles.rowActive]}>
        <Pressable style={styles.rowText} onPress={() => navigation.navigate("ContentItem", { kind, id: item.id })}>
          <Text style={styles.summary} numberOfLines={2}>
            {config.summary(item)}
          </Text>
        </Pressable>
        <Pressable onPressIn={drag} disabled={isActive} hitSlop={8} accessibilityLabel="Drag to reorder">
          <Ionicons name="reorder-three" size={26} color="#999" />
        </Pressable>
      </View>
    </ScaleDecorator>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <DraggableFlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => saveOrder(data)}
        ListEmptyComponent={<Text style={styles.empty}>{config.emptyText}</Text>}
        ListFooterComponent={
          <Pressable style={styles.addButton} onPress={() => navigation.navigate("ContentItem", { kind })}>
            <Text style={styles.addText}>Add {config.singular}</Text>
          </Pressable>
        }
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  rowActive: { backgroundColor: "#f4f4f4" },
  rowText: { flex: 1 },
  summary: { fontSize: 15, color: "#2f2f2f" },
  empty: { padding: 20, fontSize: 14, color: "#666", lineHeight: 20 },
  addButton: { margin: 20, borderWidth: 1, borderColor: "#2f2f2f", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  addText: { fontSize: 15, fontWeight: "600", color: "#2f2f2f" },
  error: { color: "#b3261e", fontSize: 14, paddingHorizontal: 20, paddingTop: 12 },
});
