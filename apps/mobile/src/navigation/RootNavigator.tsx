import React from "react";
import { Pressable, Text } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator, type NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { logOut } from "@skedgelife/data";
import ProfileScreen from "../screens/ProfileScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import SequenceBuilderScreen from "../screens/SequenceBuilderScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import WebsiteScreen from "../screens/website/WebsiteScreen";
import WebsitePreviewScreen from "../screens/WebsitePreviewScreen";
import LookScreen from "../screens/website/LookScreen";
import ContentListScreen from "../screens/website/ContentListScreen";
import ContentItemScreen from "../screens/website/ContentItemScreen";
import GalleryScreen from "../screens/website/GalleryScreen";
import type { ContentKind } from "../screens/website/contentKinds";
import WelcomeScreen from "../auth/WelcomeScreen";
import SignUpScreen from "../auth/SignUpScreen";
import LogInScreen from "../auth/LogInScreen";
import { useAuth } from "../auth/AuthProvider";
import { ProfileProvider, useProfile } from "../data/ProfileProvider";
import { supabase } from "../lib/supabase";

export type AuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  LogIn: undefined;
};

export type TabParamList = {
  Schedule: undefined;
  Profile: undefined;
  Website: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  EditProfile: undefined;
  WebsitePreview: undefined;
  Look: undefined;
  ContentList: { kind: ContentKind };
  ContentItem: { kind: ContentKind; id?: string };
  Gallery: undefined;
  SequenceBuilder: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Schedule: ["calendar", "calendar-outline"],
  Profile: ["person-circle", "person-circle-outline"],
  Website: ["globe", "globe-outline"],
};

function LogOutButton() {
  return (
    <Pressable onPress={() => logOut(supabase)} style={{ paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 15 }}>Log out</Text>
    </Pressable>
  );
}

// The Sequence Builder is a teaching tool, not a tab; it opens from the
// Schedule tab for people who teach. (It becomes a paid feature later.)
function SequencesButton() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { state } = useProfile();
  if (state.status !== "ready" || !state.profile.teaches) return null;
  return (
    <Pressable
      onPress={() => navigation.navigate("SequenceBuilder")}
      style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 16 }}
    >
      <Ionicons name="list-outline" size={18} color="#2f2f2f" />
      <Text style={{ fontSize: 15 }}>Sequences</Text>
    </Pressable>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Profile"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: "#2f2f2f",
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Schedule" component={ScheduleScreen} options={{ headerRight: () => <SequencesButton /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerRight: () => <LogOutButton /> }} />
      <Tab.Screen name="Website" component={WebsiteScreen} />
    </Tab.Navigator>
  );
}

function SignedIn({ userId }: { userId: string }) {
  return (
    <ProfileProvider userId={userId}>
      <MainStack.Navigator>
        <MainStack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
        <MainStack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ title: "Edit profile", presentation: "modal" }}
        />
        <MainStack.Screen
          name="WebsitePreview"
          component={WebsitePreviewScreen}
          options={{ title: "Preview", presentation: "modal" }}
        />
        <MainStack.Screen name="Look" component={LookScreen} />
        <MainStack.Screen name="ContentList" component={ContentListScreen} />
        <MainStack.Screen name="ContentItem" component={ContentItemScreen} options={{ presentation: "modal" }} />
        <MainStack.Screen name="Gallery" component={GalleryScreen} />
        <MainStack.Screen name="SequenceBuilder" component={SequenceBuilderScreen} options={{ title: "Sequence Builder" }} />
      </MainStack.Navigator>
    </ProfileProvider>
  );
}

export default function RootNavigator() {
  const auth = useAuth();
  if (auth.status === "loading") return null;

  return (
    <NavigationContainer>
      {auth.status === "signed-in" ? (
        // Keyed by user so switching accounts starts from a fresh profile load.
        <SignedIn key={auth.session.user.id} userId={auth.session.user.id} />
      ) : (
        <AuthStack.Navigator>
          <AuthStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <AuthStack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Sign up" }} />
          <AuthStack.Screen name="LogIn" component={LogInScreen} options={{ title: "Log in" }} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
