import { setNavigationColorByPath } from '@/utils/setNavigationColorByPath';
import { TamaguiProvider } from '@tamagui/core';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';
import { AuthProvider, BudgetProvider, ExpenseProvider, TripProvider } from '../contexts';
import { DatabaseProvider, useDbReady } from '../providers/DatabaseProvider';
import { QueryProvider } from '../providers/QueryProvider';
import '../reactotron-config';
import config from '../tamagui.config';

function AppContent() {
  const isReady = useDbReady();
  const currentPath = usePathname();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  setNavigationColorByPath(currentPath);
  return (
    <AuthProvider>
      <TripProvider>
        <ExpenseProvider>
          <BudgetProvider>
            <YStack paddingTop="$4" backgroundColor="transparent" />
            <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
              <StatusBar style="dark" backgroundColor="transparent" translucent />

              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(main)" />
                <Stack.Screen name="auth/naver/callback" />
              </Stack>
            </SafeAreaView>
          </BudgetProvider>
        </ExpenseProvider>
      </TripProvider>
    </AuthProvider>
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
