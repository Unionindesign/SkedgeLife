import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthState = { status: "loading" } | { status: "signed-out" } | { status: "signed-in"; session: Session };

const AuthContext = createContext<AuthState>({ status: "loading" });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const toState = (session: Session | null): AuthState =>
      session ? { status: "signed-in", session } : { status: "signed-out" };

    supabase.auth.getSession().then(({ data }) => setState(toState(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setState(toState(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
