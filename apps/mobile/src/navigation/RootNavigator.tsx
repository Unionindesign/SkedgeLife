import React from "react";
import { Pressable, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InstructorProfileScreen from "../screens/InstructorProfileScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import SequenceBuilderScreen from "../screens/SequenceBuilderScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import WelcomeScreen from "../auth/WelcomeScreen";
import SignUpScreen from "../auth/SignUpScreen";
import LogInScreen from "../auth/LogInScreen";
import { useAuth } from "../auth/AuthProvider";
import { ProfileProvider } from "../data/ProfileProvider";
import { supabase } from "../lib/supabase";

export type AuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  LogIn: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  EditProfile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator();

function LogOutButton() {
  return (
    <Pressable onPress={() => supabase.auth.signOut()} style={{ paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 15 }}>Log out</Text>
    </Pressable>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="Profile"
        component={InstructorProfileScreen}
        options={{ headerRight: () => <LogOutButton /> }}
      />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Sequences" component={SequenceBuilderScreen} options={{ title: "Sequence Builder" }} />
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
