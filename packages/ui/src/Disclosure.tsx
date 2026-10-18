import React, { useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View, type TextStyle } from "react-native";

export type DisclosureItem = { key: string; title: string; content: React.ReactNode };

type Props = {
  items: DisclosureItem[];
  accentColor: string;
  titleStyle?: TextStyle | null;
};

// Screens at least this wide show tabs; narrower ones (phones) show an accordion.
export const WIDE_SCREEN = 768;

// Titled items, one open at a time: tabs across the top, the open one's
// content below.
export function Tabs({ items, accentColor, titleStyle }: Props) {
  const [open, setOpen] = useState(items[0]?.key);
  const current = items.find((i) => i.key === open) ?? items[0];
  return (
    <View>
      <View style={styles.tabBar} accessibilityRole="tablist">
        {items.map((item) => {
          const selected = item.key === current?.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setOpen(item.key)}
              style={[styles.tab, selected && { borderBottomColor: accentColor }]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.tabText, titleStyle, selected && { color: accentColor }]}>{item.title}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.panel}>{current?.content}</View>
    </View>
  );
}

// Titled items that open one at a time below their heading; tap again to close.
export function Accordion({ items, accentColor, titleStyle }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <View>
      {items.map((item) => {
        const expanded = item.key === open;
        return (
          <View key={item.key} style={styles.accordionItem}>
            <Pressable
              onPress={() => setOpen(expanded ? null : item.key)}
              style={styles.accordionHeader}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              <Text style={[styles.accordionTitle, titleStyle]}>{item.title}</Text>
              <Text style={[styles.chevron, { color: accentColor }]}>{expanded ? "−" : "+"}</Text>
            </Pressable>
            {expanded ? <View style={styles.accordionBody}>{item.content}</View> : null}
          </View>
        );
      })}
    </View>
  );
}

// Tabs on wide screens, an accordion on phones.
export function TabsOrAccordion(props: Props) {
  const { width } = useWindowDimensions();
  return width >= WIDE_SCREEN ? <Tabs {...props} /> : <Accordion {...props} />;
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: "row", flexWrap: "wrap", borderBottomWidth: 1, borderBottomColor: "#ddd" },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  tabText: { fontSize: 15, fontWeight: "600", color: "#555" },
  panel: { paddingVertical: 16 },
  accordionItem: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ccc" },
  accordionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  accordionTitle: { fontSize: 16, fontWeight: "600", color: "#2f2f2f", flex: 1 },
  chevron: { fontSize: 22, fontWeight: "600", marginLeft: 12 },
  accordionBody: { paddingBottom: 14 },
});
