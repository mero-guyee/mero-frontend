import { setNavigationColorByPath } from '@/utils/setNavigationColorByPath';
import { TamaguiProvider } from '@tamagui/core';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalProvider } from 'tamagui';
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
            <StatusBar style="dark" backgroundColor="transparent" translucent />
            <PortalProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(main)" />
                <Stack.Screen name="auth/naver/callback" />
              </Stack>
            </PortalProvider>
          </BudgetProvider>
        </ExpenseProvider>
      </TripProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.ttf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
