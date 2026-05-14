import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import LawnMeasureScreen from '../screens/customer/LawnMeasureScreen';
import RequestJobScreen from '../screens/customer/RequestJobScreen';
import JobStatusScreen from '../screens/customer/JobStatusScreen';
import JobHistoryScreen from '../screens/customer/JobHistoryScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';

import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
      <Stack.Screen
        name="LawnMeasure"
        component={LawnMeasureScreen}
        options={{ headerShown: true, title: 'Outline your lawn' }}
      />
      <Stack.Screen
        name="RequestJob"
        component={RequestJobScreen}
        options={{ headerShown: true, title: 'Request a mow' }}
      />
      <Stack.Screen
        name="JobStatus"
        component={JobStatusScreen}
        options={{ headerShown: true, title: 'Job status' }}
      />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JobHistory" component={JobHistoryScreen} />
      <Stack.Screen
        name="JobStatus"
        component={JobStatusScreen}
        options={{ headerShown: true, title: 'Job status' }}
      />
    </Stack.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === 'Home' ? 'leaf' :
            route.name === 'History' ? 'time' :
            'person-circle';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="History" component={HistoryStack} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
}
