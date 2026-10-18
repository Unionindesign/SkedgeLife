import React, { useState } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

// Without a paragraph break, text this long is cut to `collapsedLines`.
const LONG_TEXT = 400;

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
  const paragraphs = text.trim().split(/\n\s*\n/);
  const byParagraph = paragraphs.length > 1;
  const link = { color: linkColor, fontWeight: "600" as const };

  if (!byParagraph && text.length <= LONG_TEXT) return <Text style={style}>{text}</Text>;
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
  if (byParagraph) {
    return (
      <Text style={style}>
        {paragraphs[0]}{" "}
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
