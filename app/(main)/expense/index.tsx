import { BudgetView } from '@/components/expense/BudgetView';
import { ExpensesView } from '@/components/expense/ExpensesView';
import TabScreenHeader from '@/components/ui/header/TabScreenHeader';
import { SubTabs } from '@/components/ui/tabbar/subTabs/SubTabs';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { YStack } from 'tamagui';

const routes = [
  { key: 'expenses', title: '지출 내역' },
  { key: 'budget', title: '예산 관리' },
];

export default function ExpenseScreen() {
  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();

  return (
    <YStack flex={1} backgroundColor="$background">
      <TabScreenHeader label="지갑" />

      <TabView
        navigationState={{ index, routes }}
        renderScene={({ route }) => {
          switch (route.key) {
            case 'expenses':
              return <ExpensesView />;
            case 'budget':
              return <BudgetView />;
            default:
              return null;
          }
        }}
        renderTabBar={(props) => (
          <SubTabs
            tabs={props.navigationState.routes.map((r) => ({ value: r.key, label: r.title! }))}
            activeTab={props.navigationState.routes[props.navigationState.index].key}
            onTabChange={props.jumpTo}
            swipePosition={props.position}
          />
        )}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </YStack>
  );
}
