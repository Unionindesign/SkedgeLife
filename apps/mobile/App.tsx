import React from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
// Per-weight subpath imports; the package root bundles every weight.
import { Arvo_700Bold } from "@expo-google-fonts/arvo/700Bold";
import { GreatVibes_400Regular } from "@expo-google-fonts/great-vibes/400Regular";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/auth/AuthProvider";

export default function App() {
  // Keys must match the font names in packages/skins.
  const [fontsLoaded, fontError] = useFonts({
    Arvo: Arvo_700Bold,
    GreatVibes: GreatVibes_400Regular,
  });

  // On a load error, render anyway; text falls back to the system font.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
