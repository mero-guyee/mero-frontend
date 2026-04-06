import { toastConfig } from '@/components/ui/CustomToast';
import CustomTabBar from '@/components/ui/tabbar/CustomTabBar';
import useBackHandler from '@/hooks/useBackHandler';
import { Tabs } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useActiveTripGuard } from '../../hooks/useActiveTripGuard';

export default function MainLayout() {
  useActiveTripGuard();
  useBackHandler();

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {},
          animation: 'shift',
          transitionSpec: {
            animation: 'spring',
            config: {
              speed: 130,
            },
          },
        }}
      >
        <Tabs.Screen name="backpack" />
        <Tabs.Screen name="footprint" />
        <Tabs.Screen name="map" />
        <Tabs.Screen name="expense" />
        <Tabs.Screen name="settings" />
        <Tabs.Screen
          name="trips"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>
      <Toast config={toastConfig} />
    </>
  );
}
