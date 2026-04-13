import { ExpenseSubTabs } from '@/components/expense/ExpenseSubTabs';
import TabScreenHeader from '@/components/ui/header/TabScreenHeader';
import { useState } from 'react';
import { YStack } from 'tamagui';
import { BudgetView } from '../../../components/expense/BudgetView';
import { ExpensesView } from '../../../components/expense/ExpensesView';

type TabMode = 'expenses' | 'budget';

export default function ExpenseScreen() {
  const [activeTab, setActiveTab] = useState<TabMode>('expenses');

  return (
    <YStack flex={1} backgroundColor="$background">
      <TabScreenHeader label="지갑" />

      <ExpenseSubTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'expenses' ? <ExpensesView /> : <BudgetView />}
    </YStack>
  );
}
