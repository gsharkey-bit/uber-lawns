import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import MowerHomeScreen from '../screens/mower/MowerHomeScreen';
import JobDetailsScreen from '../screens/mower/JobDetailsScreen';
import ConfirmOutlineScreen from '../screens/mower/ConfirmOutlineScreen';
import ActiveJobScreen from '../screens/mower/ActiveJobScreen';
import EarningsScreen from '../screens/mower/EarningsScreen';
import MowerProfileScreen from '../screens/mower/MowerProfileScreen';
import VerifyMowerScreen from '../screens/mower/VerifyMowerScreen';
import ChatScreen from '../screens/shared/ChatScreen';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MowerHome" component={MowerHomeScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} options={{ headerShown: true, title: 'Job details' }} />
      <Stack.Screen name="ConfirmOutline" component={ConfirmOutlineScreen} options={{ headerShown: true, title: 'Verify lawn' }} />
      <Stack.Screen name="ActiveJob" component={ActiveJobScreen} options={{ headerShown: true, title: 'Active job' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Chat' }} />
    </Stack.Navigator>
  );
}

function EarningsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EarningsHome" component={EarningsScreen} />
      <Stack.Screen name="ActiveJob" component={ActiveJobScreen} options={{ headerShown: true, title: 'Job' }} />
    </Stack.Navigator>
  );
}

export default function MowerNavigator() {
  const { user } = useAuth();
  if (!user.verified) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Verify" component={VerifyMowerScreen} />
      </Stack.Navigator>
    );
  }
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icon = route.name === 'Jobs' ? 'list' : route.name === 'Earnings' ? 'cash' : 'person-circle';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Jobs" component={HomeStack} />
      <Tab.Screen name="Earnings" component={EarningsStack} />
      <Tab.Screen name="Profile" component={MowerProfileScreen} />
    </Tab.Navigator>
  );
}
