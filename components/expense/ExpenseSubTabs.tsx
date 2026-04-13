import { Button, Text, XStack, YStack } from 'tamagui';

type TabMode = 'expenses' | 'budget';

interface ExpenseSubTabsProps {
  activeTab: TabMode;
  onTabChange: (tab: TabMode) => void;
}

export function ExpenseSubTabs({ activeTab, onTabChange }: ExpenseSubTabsProps) {
  return (
    <YStack paddingTop="$4" paddingHorizontal="$5">
      <XStack
        backgroundColor="$card"
        padding="$1"
        borderRadius="$4"
        borderWidth={1}
        borderColor="$border"
      >
        <Button
          flex={1}
          height={40}
          borderRadius="$3"
          borderWidth={0}
          backgroundColor={activeTab === 'expenses' ? '$accent' : 'transparent'}
          pressStyle={{ backgroundColor: activeTab === 'expenses' ? '$accent' : '$muted' }}
          onPress={() => onTabChange('expenses')}
        >
          <Text
            color={activeTab === 'expenses' ? '$foreground' : '$mutedForeground'}
            fontSize={14}
            fontWeight="500"
          >
            지출 내역
          </Text>
        </Button>
        <Button
          flex={1}
          height={40}
          borderRadius="$3"
          borderWidth={0}
          backgroundColor={activeTab === 'budget' ? '$accent' : 'transparent'}
          pressStyle={{ backgroundColor: activeTab === 'budget' ? '$accent' : '$muted' }}
          onPress={() => onTabChange('budget')}
        >
          <Text
            color={activeTab === 'budget' ? '$foreground' : '$mutedForeground'}
            fontSize={14}
            fontWeight="500"
          >
            예산 관리
          </Text>
        </Button>
      </XStack>
    </YStack>
  );
}
