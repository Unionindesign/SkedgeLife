import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/RootNavigator";
import { authStyles } from "./styles";

export default function WelcomeScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, "Welcome">) {
  return (
    <View style={[authStyles.container, styles.center]}>
      <Text style={styles.title}>SkedgeLife</Text>
      <Text style={styles.tagline}>Your page and your schedule, set up from your phone in minutes.</Text>
      <Pressable style={[authStyles.button, styles.wide]} onPress={() => navigation.navigate("SignUp")}>
        <Text style={authStyles.buttonText}>Sign up</Text>
      </Pressable>
      <Text style={authStyles.link} onPress={() => navigation.navigate("LogIn")}>
        I already have an account
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center" },
  title: { fontSize: 36, fontWeight: "700", color: "#2f2f2f" },
  tagline: { fontSize: 16, color: "#555", textAlign: "center", marginTop: 12, maxWidth: 300 },
  wide: { alignSelf: "stretch" },
});
