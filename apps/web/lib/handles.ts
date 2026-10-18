// Mirrors the handle_format check on public.profiles (lowercase letters,
// digits, underscores, 3 to 30 long). Reserved words never belong to a
// profile, so a lookup for one finds nothing and gets the 404 page.
const HANDLE = /^[a-z0-9_]{3,30}$/;

// What to do with the handle in a URL: serve it, redirect to its lowercase
// form, or 404 without asking the database.
export function routeHandle(
  raw: string,
): { kind: "serve"; handle: string } | { kind: "redirect"; handle: string } | { kind: "not-found" } {
  const handle = decodeURIComponent(raw);
  const lower = handle.toLowerCase();
  if (!HANDLE.test(lower)) return { kind: "not-found" };
  return handle === lower ? { kind: "serve", handle } : { kind: "redirect", handle: lower };
}
