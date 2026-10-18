"use client";

import React, { useState } from "react";
import { collapseText } from "../shared/logic";
import styles from "./ui.module.css";

// The web version of ExpandableText (see ../ExpandableText.tsx): long text cut
// at its first paragraph (or after a few lines) with "… more". The whole text
// is in the HTML either way, so search engines read all of it.
export function ExpandableText({
  text,
  linkColor,
  className,
}: {
  text: string;
  linkColor: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapse = collapseText(text);
  const paragraphs = text.trim().split(/\n\s*\n/);
  const link = (
    <button
      type="button"
      className={styles.moreLink}
      style={{ color: linkColor }}
      onClick={() => setExpanded(!expanded)}
    >
      {expanded ? "less" : "… more"}
    </button>
  );

  if (collapse.mode === "none") {
    return (
      <div className={className}>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
  }
  // Collapsed at a paragraph break, only the first paragraph shows; the link
  // goes at the end of the last paragraph that's showing.
  const cutAtParagraph = !expanded && collapse.mode === "paragraph";
  const lastShown = cutAtParagraph ? 0 : paragraphs.length - 1;
  return (
    <div className={[className, !expanded && collapse.mode === "lines" ? styles.clamped : ""].join(" ")}>
      {paragraphs.map((p, i) => (
        <p key={i} hidden={cutAtParagraph && i > 0}>
          {p} {i === lastShown ? link : null}
        </p>
      ))}
    </div>
  );
}
