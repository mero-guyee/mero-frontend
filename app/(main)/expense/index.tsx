import { ExpenseSubTabs } from '@/components/expense/ExpenseSubTabs';
import PlusButton from '@/components/ui/button/PlusButton';
import TabScreenHeader from '@/components/ui/header/TabScreenHeader';
import { useTrips } from '@/contexts';
import { Plus } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { YStack } from 'tamagui';
import { BudgetView } from '../../../components/expense/BudgetView';
import { ExpensesView } from '../../../components/expense/ExpensesView';

type TabMode = 'expenses' | 'budget';

export default function ExpenseScreen() {
  const [activeTab, setActiveTab] = useState<TabMode>('expenses');
  const { activeTrip } = useTrips();
  const handleAddExpense = () => {
    router.push({ pathname: '/expense/new', params: { tripId: activeTrip } });
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <TabScreenHeader label="지갑">
        <PlusButton onPress={handleAddExpense}>
          <Plus size="$5" />
        </PlusButton>
      </TabScreenHeader>

      <ExpenseSubTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'expenses' ? <ExpensesView /> : <BudgetView />}
    </YStack>
  );
}
