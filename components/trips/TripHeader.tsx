import { paddingHorizontalGeneral } from '@/constants/theme';
import { Backpack, Settings } from '@tamagui/lucide-icons';
import { Text, XStack, YStack } from 'tamagui';
import { CircularButton } from '../ui';

interface TripHeaderProps {
  onSettings: () => void;
}

export function TripHeader({ onSettings }: TripHeaderProps) {
  return (
    <YStack backgroundColor="$background" padding={paddingHorizontalGeneral}>
      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap="$3">
          <YStack
            width={48}
            height={48}
            backgroundColor="$accent"
            borderRadius={24}
            alignItems="center"
            justifyContent="center"
          >
            <Backpack size={24} color="$foreground" />
          </YStack>
          <YStack>
            <Text fontSize={18} fontWeight="600" color="$foreground">
              {}씨의 기록
            </Text>
            <Text fontSize={14} color="$mutedForeground">
              세계는 넓고 갈 곳은 많습니다
            </Text>
          </YStack>
        </XStack>

        <CircularButton mr="$1" pressStyle={{ backgroundColor: '$muted' }} onPress={onSettings}>
          <Settings size="$7" color="$foreground" />
        </CircularButton>
      </XStack>
    </YStack>
  );
}
