// Logic shared by the React Native components (../) and their web versions
// (../web), so both platforms behave the same.

// Without a paragraph break, text longer than this gets cut after a few lines.
export const LONG_TEXT = 400;

// How long text is cut short: at its first paragraph break, after a few
// lines, or not at all.
export function collapseText(
  text: string,
): { mode: "paragraph"; first: string } | { mode: "lines" } | { mode: "none" } {
  const paragraphs = text.trim().split(/\n\s*\n/);
  if (paragraphs.length > 1) return { mode: "paragraph", first: paragraphs[0] };
  return text.length > LONG_TEXT ? { mode: "lines" } : { mode: "none" };
}

// Screens at least this wide get tabs; narrower ones (phones) get accordions.
export const WIDE_SCREEN = 768;

// How far a parallax background slides while its section crosses the screen
// (from its top entering at the bottom to its bottom leaving at the top).
// The image is this much taller than the section, so it always covers it.
export function parallaxTravel(viewportHeight: number, sectionHeight: number, speed: number) {
  return (viewportHeight + sectionHeight) * speed;
}

// Where the image sits (a translateY, from -travel to 0) given where the
// section is: `sectionTop` is its top edge relative to the top of the screen.
export function parallaxOffset(viewportHeight: number, sectionTop: number, sectionHeight: number, speed: number) {
  const travel = parallaxTravel(viewportHeight, sectionHeight, speed);
  const progress = Math.min(1, Math.max(0, (viewportHeight - sectionTop) / (viewportHeight + sectionHeight)));
  return { travel, translateY: -travel + progress * travel };
}
