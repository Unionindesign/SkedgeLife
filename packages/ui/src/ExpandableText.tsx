import React, { useState } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";
import { collapseText } from "./shared/logic";

// Long text cut short with "… more"; tap to show it all ("less" folds it
// back). Cuts at the first paragraph break when there is one, otherwise
// after a few lines.
export function ExpandableText({
  text,
  style,
  linkColor,
  collapsedLines = 6,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  linkColor: string;
  collapsedLines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapse = collapseText(text);
  const link = { color: linkColor, fontWeight: "600" as const };

  if (collapse.mode === "none") return <Text style={style}>{text}</Text>;
  if (expanded) {
    return (
      <Text style={style}>
        {text}{" "}
        <Text style={link} onPress={() => setExpanded(false)} accessibilityRole="button">
          less
        </Text>
      </Text>
    );
  }
  if (collapse.mode === "paragraph") {
    return (
      <Text style={style}>
        {collapse.first}{" "}
        <Text style={link} onPress={() => setExpanded(true)} accessibilityRole="button">
          … more
        </Text>
      </Text>
    );
  }
  return (
    <>
      <Text style={style} numberOfLines={collapsedLines}>
        {text}
      </Text>
      <Text style={[style, link]} onPress={() => setExpanded(true)} accessibilityRole="button">
        … more
      </Text>
    </>
  );
}
