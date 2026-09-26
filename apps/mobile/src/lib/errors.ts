// Supabase errors are plain objects with a message, not Error instances.
export function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string" && err.message) {
    return err.message;
  }
  return String(err);
}
