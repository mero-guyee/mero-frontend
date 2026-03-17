import { Text, XStack, YStack } from 'tamagui';
import { Button } from 'tamagui';

export type SubTab = 'memos' | 'files';

interface TripSubTabsProps {
  activeTab: SubTab;
  onTabChange: (tab: SubTab) => void;
}

export function TripSubTabs({ activeTab, onTabChange }: TripSubTabsProps) {
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
          backgroundColor={activeTab === 'memos' ? '$accent' : 'transparent'}
          pressStyle={{ backgroundColor: activeTab === 'memos' ? '$accent' : '$muted' }}
          onPress={() => onTabChange('memos')}
        >
          <Text
            color={activeTab === 'memos' ? '$foreground' : '$mutedForeground'}
            fontSize={14}
            fontWeight="500"
          >
            📝 메모
          </Text>
        </Button>
        <Button
          flex={1}
          height={40}
          borderRadius="$3"
          backgroundColor={activeTab === 'files' ? '$accent' : 'transparent'}
          pressStyle={{ backgroundColor: activeTab === 'files' ? '$accent' : '$muted' }}
          onPress={() => onTabChange('files')}
        >
          <Text
            color={activeTab === 'files' ? '$foreground' : '$mutedForeground'}
            fontSize={14}
            fontWeight="500"
          >
            📂 서류
          </Text>
        </Button>
      </XStack>
    </YStack>
  );
}
