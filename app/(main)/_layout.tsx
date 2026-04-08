import { toastConfig } from '@/components/ui/CustomToast';
import CustomTabBar from '@/components/ui/tabbar/CustomTabBar';
import useBackHandler from '@/hooks/useBackHandler';
import { Backpack, BookOpen, Map, Settings, Wallet } from '@tamagui/lucide-icons';
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
          animation: 'shift',
          transitionSpec: {
            animation: 'spring',
            config: {
              speed: 130,
            },
          },
        }}
      >
        <Tabs.Screen
          name="backpack"
          options={{
            tabBarLabel: '배낭',
            tabBarIcon: ({ color, size }) => <Backpack size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="footprint"
          options={{
            tabBarLabel: '일지',
            tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            tabBarLabel: '지도',
            tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="expense"
          options={{
            tabBarLabel: '지갑',
            tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarLabel: '설정',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="trips"
          options={{
            tabBarLabel: '여행',
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>
      <Toast config={toastConfig} />
    </>
  );
}
