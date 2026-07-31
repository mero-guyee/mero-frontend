import { BudgetView } from '@/components/expense/BudgetView';
import { ExpensesView } from '@/components/expense/ExpensesView';
import TabScreenHeader from '@/components/ui/header/TabScreenHeader';
import { SubTabs } from '@/components/ui/tabbar/subTabs/SubTabs';
import { useTrips } from '@/contexts';
import { getDaysUntilTripStart } from '@/data/utils';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import Toast from 'react-native-toast-message';
import { YStack } from 'tamagui';

const routes = [
  { key: 'expenses', title: '지출 내역' },
  { key: 'budget', title: '예산 관리' },
];

export default function ExpenseScreen() {
  const { created } = useLocalSearchParams<{ created?: string }>();
  const { activeTrip, getTripById } = useTrips();
  const trip = activeTrip ? getTripById(activeTrip) : undefined;
  const daysUntilStart = trip ? getDaysUntilTripStart(trip.startDate) : 0;
  const tripNotStarted = daysUntilStart > 0;

  const [index, setIndex] = useState(tripNotStarted ? 1 : 0);
  const layout = useWindowDimensions();

  const handleDisabledPress = () => {
    Toast.show({
      type: 'info',
      text1: '여행 시작 후 이용할 수 있어요',
      text2: `D-${daysUntilStart} 남았어요`,
    });
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <TabScreenHeader label="지갑" />

      <TabView
        navigationState={{ index, routes }}
        renderScene={({ route }) => {
          switch (route.key) {
            case 'expenses':
              return <ExpensesView createdId={created} />;
            case 'budget':
              return <BudgetView />;
            default:
              return null;
          }
        }}
        renderTabBar={(props) => (
          <SubTabs
            tabs={props.navigationState.routes.map((r) => ({
              value: r.key,
              label: r.title!,
              disabled: r.key === 'expenses' && tripNotStarted,
            }))}
            activeTab={props.navigationState.routes[props.navigationState.index].key}
            onTabChange={props.jumpTo}
            onDisabledPress={handleDisabledPress}
            swipePosition={props.position}
          />
        )}
        onIndexChange={(newIndex) => {
          if (tripNotStarted && routes[newIndex].key === 'expenses') {
            handleDisabledPress();
            return;
          }
          setIndex(newIndex);
        }}
        initialLayout={{ width: layout.width }}
      />
    </YStack>
  );
}
