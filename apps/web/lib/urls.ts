// Links that come from user data (booking pages, online class links) are
// only ever rendered as http(s) URLs, so a "javascript:" or "data:" URL saved
// in the database can't run in a visitor's browser.
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}
