import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { JobsProvider } from './src/context/JobsContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <JobsProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </JobsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
