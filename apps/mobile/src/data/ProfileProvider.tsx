import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getProfilePage, type ProfilePage } from "@skedgelife/data";
import { supabase } from "../lib/supabase";

// Until sign-in (#10) decides whose profile to show, the app shows this seeded one.
export const DEMO_HANDLE = "michellescutti";

type ProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "not-found" }
  | { status: "ready"; profile: ProfilePage };

// Supabase errors are plain objects with a message, not Error instances.
function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string" && err.message) {
    return err.message;
  }
  return String(err);
}

const ProfileContext = createContext<{ state: ProfileState; reload: () => void } | null>(null);

export function ProfileProvider({ handle, children }: { handle: string; children: React.ReactNode }) {
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getProfilePage(supabase, handle)
      .then((profile) => {
        if (!cancelled) setState(profile ? { status: "ready", profile } : { status: "not-found" });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ status: "error", message: errorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [handle, attempt]);

  return <ProfileContext.Provider value={{ state, reload }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error("useProfile must be used inside ProfileProvider");
  return value;
}
