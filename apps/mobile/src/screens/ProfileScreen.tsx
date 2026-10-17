import React from "react";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList, TabParamList } from "../navigation/RootNavigator";
import { useProfile } from "../data/ProfileProvider";
import ProfileStatus from "../components/ProfileStatus";
import ProfilePage from "../components/ProfilePage";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Profile">,
  NativeStackScreenProps<MainStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const { state, reload } = useProfile();
  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;

  return (
    <ProfilePage
      profile={state.profile}
      variant="profile"
      action={{ label: "Edit profile", onPress: () => navigation.navigate("EditProfile") }}
      emptyHint="Your profile is ready. Tap Edit profile to add your bio, interests, and contact details."
    />
  );
}
