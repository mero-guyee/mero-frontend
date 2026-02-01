import { Stack } from 'expo-router';
import { TamaguiProvider } from '@tamagui/core';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthProvider,
  TripProvider,
  DiaryProvider,
  ExpenseProvider,
  BudgetProvider,
} from '../contexts';
import config from '../tamagui.config';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config}>
        <AuthProvider>
          <TripProvider>
            <DiaryProvider>
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
            </DiaryProvider>
          </TripProvider>
        </AuthProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
