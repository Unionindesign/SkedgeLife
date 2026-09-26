import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/RootNavigator";
import { supabase } from "../lib/supabase";
import { errorMessage } from "../lib/errors";
import { authStyles } from "./styles";

export default function LogInScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, "LogIn">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy;

  const logIn = async () => {
    setBusy(true);
    setError(null);
    // On success, AuthProvider sees the new session and the app switches to the tabs.
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError(errorMessage(error));
    setBusy(false);
  };

  return (
    <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
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
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={() => canSubmit && logIn()}
      />
      {error ? <Text style={authStyles.error}>{error}</Text> : null}
      <Pressable
        style={[authStyles.button, !canSubmit && authStyles.buttonDisabled]}
        disabled={!canSubmit}
        onPress={logIn}
      >
        <Text style={authStyles.buttonText}>{busy ? "Logging in…" : "Log in"}</Text>
      </Pressable>
      <Text style={authStyles.link} onPress={() => navigation.replace("SignUp")}>
        New here? Sign up
      </Text>
    </ScrollView>
  );
}
