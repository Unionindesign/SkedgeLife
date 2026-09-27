import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getProfilePage, type ProfilePage } from "@skedgelife/data";
import { supabase } from "../lib/supabase";
import { errorMessage } from "../lib/errors";

type ProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "not-found" }
  | { status: "ready"; profile: ProfilePage };

const ProfileContext = createContext<{ state: ProfileState; reload: () => void } | null>(null);

// Loads the signed-in user's own profile page.
export function ProfileProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    // On a refresh (e.g. after saving edits), keep showing the current profile until the new one arrives.
    setState((prev) => (prev.status === "ready" ? prev : { status: "loading" }));
    getProfilePage(supabase, { id: userId })
      .then((profile) => {
        if (!cancelled) setState(profile ? { status: "ready", profile } : { status: "not-found" });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ status: "error", message: errorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  return <ProfileContext.Provider value={{ state, reload }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error("useProfile must be used inside ProfileProvider");
  return value;
}
