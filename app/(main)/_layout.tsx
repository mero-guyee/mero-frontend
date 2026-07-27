import MainTabBar from '@/components/ui/tabbar/mainTabbar/MainTabBar';
import useBackHandler from '@/hooks/useBackHandler';
import { Backpack, BookOpen, Wallet } from 'phosphor-react-native';
import { Tabs } from 'expo-router';
import { useActiveTripGuard } from '../../hooks/useActiveTripGuard';

export default function MainLayout() {
  useActiveTripGuard();
  useBackHandler();

  return (
    <Tabs
      tabBar={(props) => <MainTabBar {...props} />}
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        transitionSpec: {
          animation: 'spring',
          config: {
            speed: 220,
          },
        },
      }}
      detachInactiveScreens={false}
    >
      <Tabs.Screen
        name="backpack"
        options={{
          tabBarLabel: '배낭',
          tabBarIcon: ({ focused, color, size }) => (
            <Backpack size={size} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="footprint"
        options={{
          tabBarLabel: '일지',
          tabBarIcon: ({ focused, color, size }) => (
            <BookOpen size={size} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="expense"
        options={{
          tabBarLabel: '지갑',
          tabBarIcon: ({ focused, color, size }) => (
            <Wallet size={size} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: '설정',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          tabBarLabel: '여행',
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
