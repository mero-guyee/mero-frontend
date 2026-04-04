import useBackHandler from '@/hooks/useBackHandler';
import { Backpack, BookOpen, Map, Settings, Wallet } from '@tamagui/lucide-icons';
import { Tabs } from 'expo-router';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/components/ui/CustomToast';
import { useActiveTripGuard } from '../../hooks/useActiveTripGuard';

export default function MainLayout() {
  useActiveTripGuard();
  useBackHandler();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#9BC4D1',
          tabBarInactiveTintColor: '#8B7355',
          tabBarStyle: {
            backgroundColor: '#FFFBF0',
            borderTopWidth: 2,
            borderTopColor: 'rgba(155, 196, 209, 0.25)',
            paddingTop: 8,
            paddingBottom: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
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
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>
      <Toast config={toastConfig} />
    </>
  );
}
