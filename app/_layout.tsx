import { TamaguiProvider } from '@tamagui/core';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthProvider,
  BudgetProvider,
  ExpenseProvider,
  FootprintProvider,
  TripProvider,
} from '../contexts';
import { DatabaseProvider, useDbReady } from '../providers/DatabaseProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { SeedDatabase } from '../providers/SeedDatabase';
import config from '../tamagui.config';

function AppContent() {
  const isReady = useDbReady();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SeedDatabase>
      <AuthProvider>
        <TripProvider>
          <FootprintProvider>
            <ExpenseProvider>
              <BudgetProvider>
                <StatusBar style="dark" />
                <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(main)" />
                  </Stack>
                </SafeAreaView>
              </BudgetProvider>
            </ExpenseProvider>
          </FootprintProvider>
        </TripProvider>
      </AuthProvider>
    </SeedDatabase>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme="light">
        <DatabaseProvider>
          <QueryProvider>
            <AppContent />
          </QueryProvider>
        </DatabaseProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
