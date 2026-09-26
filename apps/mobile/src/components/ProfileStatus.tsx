import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

type Props =
  | { status: "loading" }
  | { status: "error"; message: string; onRetry: () => void }
  | { status: "not-found" };

// Shown in place of a screen until its profile data is ready.
export default function ProfileStatus(props: Props) {
  return (
    <View style={styles.container}>
      {props.status === "loading" ? <ActivityIndicator size="large" /> : null}
      {props.status === "not-found" ? <Text style={styles.text}>This profile doesn't exist.</Text> : null}
      {props.status === "error" ? (
        <>
          <Text style={styles.text}>Couldn't load this profile.</Text>
          <Text style={styles.detail}>{props.message}</Text>
          <Pressable onPress={props.onRetry} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  text: { fontSize: 16, color: "#333", textAlign: "center" },
  detail: { fontSize: 12, color: "#888", textAlign: "center", marginTop: 8 },
  button: { marginTop: 16, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, backgroundColor: "#333" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
