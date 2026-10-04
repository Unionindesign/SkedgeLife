import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isHandleAvailable, signUp as createAccount } from "@skedgelife/data";
import type { AuthStackParamList } from "../navigation/RootNavigator";
import { supabase } from "../lib/supabase";
import { errorMessage } from "../lib/errors";
import { authStyles } from "./styles";

const MIN_PASSWORD_LENGTH = 8; // matches minimum_password_length in supabase/config.toml

type HandleStatus = "empty" | "checking" | "available" | "unavailable" | "error";

export default function SignUpScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, "SignUp">) {
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("empty");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) {
      setHandleStatus("empty");
      return;
    }
    setHandleStatus("checking");
    let stale = false;
    const timer = setTimeout(() => {
      isHandleAvailable(supabase, handle)
        .then((ok) => !stale && setHandleStatus(ok ? "available" : "unavailable"))
        .catch(() => !stale && setHandleStatus("error"));
    }, 400);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [handle]);

  const canSubmit =
    displayName.trim().length > 0 &&
    handleStatus === "available" &&
    email.trim().length > 0 &&
    password.length >= MIN_PASSWORD_LENGTH &&
    !busy;

  const signUp = async () => {
    setBusy(true);
    setError(null);
    try {
      const { signedIn } = await createAccount(supabase, { email, password, handle, displayName });
      if (!signedIn) setNotice("Check your email to confirm your account, then log in.");
      // When signed in, AuthProvider switches the app to the tabs.
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(false);
  };

  return (
    <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
      <Text style={authStyles.label}>Your name</Text>
      <TextInput style={authStyles.input} value={displayName} onChangeText={setDisplayName} autoComplete="name" />

      <Text style={authStyles.label}>Handle</Text>
      <TextInput
        style={authStyles.input}
        value={handle}
        onChangeText={(t) => setHandle(t.toLowerCase())}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="yourname"
      />
      <Text style={authStyles.hint}>Your page: skedgelife.com/{handle || "yourname"}</Text>
      {handleStatus === "empty" ? (
        <Text style={authStyles.hint}>3–30 lowercase letters, numbers, or underscores.</Text>
      ) : null}
      {handleStatus === "checking" ? <Text style={authStyles.hint}>Checking…</Text> : null}
      {handleStatus === "available" ? <Text style={authStyles.ok}>Available</Text> : null}
      {handleStatus === "unavailable" ? (
        <Text style={authStyles.bad}>Not available. Use 3–30 lowercase letters, numbers, or underscores.</Text>
      ) : null}
      {handleStatus === "error" ? <Text style={authStyles.bad}>Couldn't check this handle. Try again.</Text> : null}

      <Text style={authStyles.label}>Email</Text>
      <TextInput
        style={authStyles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />

      <Text style={authStyles.label}>Password</Text>
      <TextInput
        style={authStyles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Text style={authStyles.hint}>At least {MIN_PASSWORD_LENGTH} characters.</Text>

      {error ? <Text style={authStyles.error}>{error}</Text> : null}
      {notice ? <Text style={authStyles.notice}>{notice}</Text> : null}

      <Pressable
        style={[authStyles.button, !canSubmit && authStyles.buttonDisabled]}
        disabled={!canSubmit}
        onPress={signUp}
      >
        <Text style={authStyles.buttonText}>{busy ? "Creating your page…" : "Create my page"}</Text>
      </Pressable>
      <Text style={authStyles.link} onPress={() => navigation.replace("LogIn")}>
        Already have an account? Log in
      </Text>
    </ScrollView>
  );
}
