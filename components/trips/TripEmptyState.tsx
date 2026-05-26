import { Text, YStack } from 'tamagui';
import { FilledButton } from '../ui';

interface TripEmptyStateProps {
  onCreateTrip: () => void;
}

export function TripEmptyState({ onCreateTrip }: TripEmptyStateProps) {
  return (
    <YStack alignItems="center" justifyContent="center" paddingVertical="$5" paddingHorizontal="$4">
      <Text fontSize={20} fontWeight="600" color="$foreground" marginBottom="$2">
        첫 여정을 시작해보세요
      </Text>
      <Text color="$mutedForeground" textAlign="center" marginBottom="$6">
        새로운 모험의 기록을 남겨보세요
      </Text>
      <FilledButton
        paddingHorizontal="$6"
        backgroundColor="$primary"
        pressStyle={{ backgroundColor: '$primaryHover' }}
        onPress={onCreateTrip}
      >
        <Text color="white" fontWeight="600">
          여정 만들기
        </Text>
      </FilledButton>
    </YStack>
  );
}
