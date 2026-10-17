import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { formatClock, formatDate } from "@skedgelife/data";
import { formStyles } from "./Field";

type Props = {
  mode: "date" | "time";
  // Wall-clock values: "2026-10-20" for dates, "09:00" for times.
  value: string;
  onChange: (value: string) => void;
  minimumDate?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

// The picker works with Date objects in the device's zone. They only carry
// the wall-clock fields here; conversion to the event's zone happens on save.
function toPickerDate(mode: Props["mode"], value: string) {
  if (mode === "date") {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d, 12);
  }
  const [hh, mm] = value.split(":").map(Number);
  return new Date(2000, 0, 1, hh, mm);
}

function fromPickerDate(mode: Props["mode"], date: Date) {
  return mode === "date"
    ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// iOS shows a compact inline picker; Android opens a dialog from a button.
// The web build uses DateTimeField.web.tsx.
export default function DateTimeField({ mode, value, onChange, minimumDate }: Props) {
  const [open, setOpen] = useState(false);
  const picker = (
    <DateTimePicker
      mode={mode}
      value={toPickerDate(mode, value)}
      minimumDate={minimumDate ? toPickerDate("date", minimumDate) : undefined}
      minuteInterval={mode === "time" ? 5 : undefined}
      display={Platform.OS === "ios" ? "compact" : "default"}
      onChange={(event: DateTimePickerEvent, date?: Date) => {
        setOpen(false);
        if (event.type === "set" && date) onChange(fromPickerDate(mode, date));
      }}
    />
  );

  if (Platform.OS === "ios") return <View style={styles.iosRow}>{picker}</View>;
  return (
    <>
      <Pressable style={formStyles.input} onPress={() => setOpen(true)}>
        <Text style={styles.value}>{mode === "date" ? formatDate(value) : formatClock(value)}</Text>
      </Pressable>
      {open ? picker : null}
    </>
  );
}

const styles = StyleSheet.create({
  iosRow: { alignItems: "flex-start" },
  value: { fontSize: 16 },
});
