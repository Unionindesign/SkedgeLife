import React from "react";

type Props = {
  mode: "date" | "time";
  value: string;
  onChange: (value: string) => void;
  minimumDate?: string;
};

// The native picker doesn't support the web, so the web build uses the
// browser's own date and time inputs, which use the same value formats.
export default function DateTimeField({ mode, value, onChange, minimumDate }: Props) {
  return React.createElement("input", {
    type: mode,
    value,
    min: mode === "date" ? minimumDate : undefined,
    step: mode === "time" ? 300 : undefined,
    onChange: (e: { target: { value: string } }) => {
      if (e.target.value) onChange(e.target.value);
    },
    style: {
      border: "1px solid #ccc",
      borderRadius: 8,
      padding: "10px 12px",
      fontSize: 16,
      fontFamily: "inherit",
      background: "#fff",
    },
  });
}
