import { paddingHorizontalGeneral } from '@/constants/theme';
import { Settings } from '@tamagui/lucide-icons';
import { Image, XStack, YStack } from 'tamagui';
import { CircularButton } from '../ui';

interface TripHeaderProps {
  onSettings: () => void;
}

export function TripHeader({ onSettings }: TripHeaderProps) {
  return (
    <YStack
      backgroundColor="$background"
      paddingHorizontal={paddingHorizontalGeneral}
      paddingVertical="$2"
    >
      <XStack alignItems="center" justifyContent="space-between">
        <Image
          source={require('@/assets/typo.png')}
          width={85}
          height={24}
          objectFit="contain"
          ml="-4"
        />

        <CircularButton
          mr="$1"
          pressStyle={{ backgroundColor: '$muted' }}
          onPress={onSettings}
          testID="settings-button"
        >
          <Settings size="$7" color="$foreground" />
        </CircularButton>
      </XStack>
    </YStack>
  );
}
