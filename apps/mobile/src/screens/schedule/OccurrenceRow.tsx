import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import {
  dateDetails,
  deviceTimeZone,
  displayTimeZone,
  formatTime,
  sameWallClock,
  utcToLocal,
  zoneLabel,
  type DateDetails,
  type OccurrenceWithEvent,
} from "@skedgelife/data";

// The local day a date falls on, in the zone its times are shown in.
export function dayOf(item: OccurrenceWithEvent) {
  return utcToLocal(item.starts_at, displayTimeZone(dateDetails(item))).date;
}

export function isCancelled(item: OccurrenceWithEvent) {
  return item.status === "cancelled" || item.event.status === "cancelled";
}

function placeLabel(d: DateDetails) {
  if (d.format === "online") return "Online";
  if (d.is_private_home) return `${d.venue?.name ?? d.area ?? "Private home"} · private home`;
  return d.venue?.name ?? "";
}

// One date on the Schedule tab: time, title, place, and a booking link.
export default function OccurrenceRow({
  item,
  accent,
  onPress,
}: {
  item: OccurrenceWithEvent;
  accent: string;
  onPress: () => void;
}) {
  // The date's own changes (if any) over its event's details.
  const d = dateDetails(item);
  const zone = displayTimeZone(d);
  const cancelled = isCancelled(item);
  const zoneSuffix = sameWallClock(item.starts_at, zone, deviceTimeZone()) ? "" : ` ${zoneLabel(item.starts_at, zone)}`;
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.timeCol, { borderColor: accent }]}>
        <Text style={[styles.time, cancelled && styles.struck]}>{formatTime(item.starts_at, zone)}</Text>
        <Text style={styles.timeEnd}>
          {formatTime(item.ends_at, zone)}
          {zoneSuffix}
        </Text>
      </View>
      <View style={styles.details}>
        <Text style={[styles.title, cancelled && styles.struck]}>{d.title}</Text>
        <Text style={styles.place} numberOfLines={1}>
          {cancelled ? "Cancelled · " : item.is_modified ? "Changed · " : ""}
          {placeLabel(d)}
          {item.event.weekly_days ? " · Weekly" : ""}
        </Text>
      </View>
      {!cancelled && d.booking_mode === "external_link" && d.booking_url ? (
        <Pressable onPress={() => Linking.openURL(d.booking_url!)} hitSlop={8}>
          <Text style={[styles.book, { color: accent }]}>Book →</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e4e4e4",
    backgroundColor: "#fff",
  },
  timeCol: { width: 100, borderLeftWidth: 3, paddingLeft: 8 },
  time: { fontSize: 15, fontWeight: "600", color: "#2f2f2f" },
  timeEnd: { fontSize: 12, color: "#777", marginTop: 2 },
  details: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: "#2f2f2f" },
  place: { fontSize: 13, color: "#666", marginTop: 2 },
  struck: { textDecorationLine: "line-through", color: "#999" },
  book: { fontSize: 14, fontWeight: "600" },
});
