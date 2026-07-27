import OfflineBanner from '@/components/network/OfflineBanner';
import { toastConfig } from '@/components/ui/CustomToast';
import { setNavigationColorByPath } from '@/utils/setNavigationColorByPath';
import * as Sentry from '@sentry/react-native';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { TamaguiProvider } from '@tamagui/core';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { PortalProvider } from 'tamagui';
import {
  AuthProvider,
  BudgetProvider,
  ExpenseProvider,
  SyncProvider,
  ThemeProvider,
  TripProvider,
  useSyncContext,
  useTheme,
} from '../contexts';
import { usePendingSync } from '../hooks/sync/usePendingSync';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { DatabaseProvider, useDbReady } from '../providers/DatabaseProvider';
import { QueryProvider } from '../providers/QueryProvider';
import '../reactotron-config';
import config from '../tamagui.config';

const AppLightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F6F3EE',
    card: '#ffffff',
  },
};

const AppDarkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#1A1714',
    card: '#242019',
  },
};

Sentry.init({
  dsn: 'https://d3584d51d314d552ed61e55ddd8405a3@o4511688550449152.ingest.us.sentry.io/4511688553136128',
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: __DEV__ ? 0 : 0.2,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: __DEV__ ? 0 : 0.5,
  integrations: [Sentry.mobileReplayIntegration()],
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  useAuthGuard();
  return <>{children}</>;
}

function SyncManager() {
  usePendingSync();
  const { clearTransientState } = useSyncContext();
  const currentPath = usePathname();

  useEffect(() => {
    clearTransientState();
  }, [clearTransientState, currentPath]);
  return null;
}

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <TamaguiProvider config={config} defaultTheme={theme}>
      <NavigationThemeProvider value={theme === 'dark' ? AppDarkNavTheme : AppLightNavTheme}>
        {children}
      </NavigationThemeProvider>
    </TamaguiProvider>
  );
}

function AppContent() {
  const isReady = useDbReady();
  const currentPath = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    console.log('[route]', currentPath);
  }, [currentPath]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  setNavigationColorByPath(currentPath, theme);
  return (
    <AuthProvider>
      <AuthGuard>
        <SyncProvider>
          <TripProvider>
            <ExpenseProvider>
              <BudgetProvider>
                <SyncManager />
                <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent />
                <OfflineBanner />
                <Toast config={toastConfig} />
                <PortalProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen name="(main)" />
                    <Stack.Screen name="auth/naver/callback" />
                    <Stack.Screen name="expense-new" />
                    <Stack.Screen name="expense-detail" />
                  </Stack>
                </PortalProvider>
              </BudgetProvider>
            </ExpenseProvider>
          </TripProvider>
        </SyncProvider>
      </AuthGuard>
    </AuthProvider>
  );
}

export default Sentry.wrap(function RootLayout() {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedApp>
            <DatabaseProvider>
              <QueryProvider>
                <AppContent />
              </QueryProvider>
            </DatabaseProvider>
          </ThemedApp>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
