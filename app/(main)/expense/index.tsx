import { useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { BudgetView } from '../../../components/expense/BudgetView';
import { ExpensesView } from '../../../components/expense/ExpensesView';
import { useTrips } from '../../../contexts';

type TabMode = 'expenses' | 'budget';

export default function ExpenseScreen() {
  const [activeTab, setActiveTab] = useState<TabMode>('expenses');
  const insets = useSafeAreaInsets();
  const { trips, activeTrip } = useTrips();

  const activeTripData = activeTrip ? trips.find((t) => t.id === activeTrip) : null;

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack
        backgroundColor="$card"
        paddingTop={insets.top}
        paddingHorizontal="$4"
        paddingBottom="$3"
        borderBottomWidth={2}
        style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
      >
        <Text color="$foreground" fontSize={18} fontWeight="600">
          👛 지갑
        </Text>
        {activeTripData && (
          <Text color="$mutedForeground" fontSize={14} marginTop="$0.5">
            {activeTripData.title}
          </Text>
        )}

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
      </YStack>

      {activeTab === 'expenses' ? <ExpensesView /> : <BudgetView />}
    </YStack>
  );
}
