import type { SkedgeLifeClient } from "./client";

// Shared by the mobile app and, later, the web app (#14). Each app supplies
// its own client: AsyncStorage sessions on mobile, cookies on web.

export type SignUpDetails = { email: string; password: string; handle: string; displayName: string };

// The on_auth_user_created trigger creates the profile from this metadata.
// Returns whether the user is signed in straight away (false when email
// confirmation is on).
export async function signUp(client: SkedgeLifeClient, details: SignUpDetails) {
  const { data, error } = await client.auth.signUp({
    email: details.email.trim(),
    password: details.password,
    options: { data: { handle: details.handle, display_name: details.displayName.trim() } },
  });
  if (error) throw error;
  return { signedIn: Boolean(data.session) };
}

export async function logIn(client: SkedgeLifeClient, email: string, password: string) {
  const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function logOut(client: SkedgeLifeClient) {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

// Checks format, reserved words, and whether the handle is taken.
export async function isHandleAvailable(client: SkedgeLifeClient, handle: string) {
  const { data, error } = await client.rpc("is_handle_available", { h: handle });
  if (error) throw error;
  return data;
}
