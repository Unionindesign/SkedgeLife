import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import InstructorProfileScreen from "../screens/InstructorProfileScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import SequenceBuilderScreen from "../screens/SequenceBuilderScreen";

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: true }}>
        <Tab.Screen name="Profile" component={InstructorProfileScreen} />
        <Tab.Screen name="Schedule" component={ScheduleScreen} />
        <Tab.Screen name="Sequences" component={SequenceBuilderScreen} options={{ title: "Sequence Builder" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
