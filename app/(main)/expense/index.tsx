import PlusButton from '@/components/ui/button/PlusButton';
import TabScreenHeader from '@/components/ui/header/TabScreenHeader';
import { useTrips } from '@/contexts';
import { Plus } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
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

      <XStack
        marginTop="$3"
        backgroundColor="rgba(155, 196, 209, 0.15)"
        borderRadius="$4"
        padding="$1"
      >
        <Pressable style={{ flex: 1 }} onPress={() => setActiveTab('expenses')}>
          <YStack
            height={40}
            borderRadius="$3"
            backgroundColor={activeTab === 'expenses' ? '$card' : 'transparent'}
            alignItems="center"
            justifyContent="center"
          >
            <Text color={activeTab === 'expenses' ? '$foreground' : '$mutedForeground'}>
              지출 내역
            </Text>
          </YStack>
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => setActiveTab('budget')}>
          <YStack
            height={40}
            borderRadius="$3"
            backgroundColor={activeTab === 'budget' ? '$card' : 'transparent'}
            alignItems="center"
            justifyContent="center"
          >
            <Text color={activeTab === 'budget' ? '$foreground' : '$mutedForeground'}>
              예산 관리
            </Text>
          </YStack>
        </Pressable>
      </XStack>

      {activeTab === 'expenses' ? <ExpensesView /> : <BudgetView />}
    </YStack>
  );
}
