import { TripStatus } from '@/types';
import { Text, XStack, YStack } from 'tamagui';

const tripProgressStatusText: Record<TripStatus, string> = {
  ongoing: '진행 중 ✨',
  completed: '여행 완료 🎉',
  planned: '곧 시작 예정 ⏳',
};

export default function TripProgress({
  tripStartDate,
  tripEndDate,
}: {
  tripStartDate: string;
  tripEndDate: string;
}) {
  const startDate = new Date(tripStartDate);
  const endDate = new Date(tripEndDate);
  const today = new Date();
  const states: Record<TripStatus, boolean> = {
    planned: new Date() < startDate,
    ongoing: startDate < endDate,
    completed: new Date() > endDate,
  };
  const totalDays =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysPassed = Math.max(
    0,
    Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const daysRemaining = Math.max(
    0,
    Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );
  const progress = Math.min(100, (daysPassed / totalDays) * 100);

  const currentState = (Object.keys(states) as TripStatus[]).find((key) => states[key])!;

  return (
    <YStack backgroundColor="$muted" borderRadius="$4" padding="$3">
      <XStack justifyContent="space-between" marginBottom="$2">
        <Text color="$mutedForeground" fontSize={14}>
          {tripProgressStatusText[currentState]}
        </Text>
        {currentState === 'ongoing' && (
          <Text color="$mutedForeground" fontSize={14}>
            D+{daysPassed} / {totalDays}일
          </Text>
        )}
        {currentState === 'planned' && (
          <Text color="$mutedForeground" fontSize={14}>
            D-{daysRemaining}
          </Text>
        )}
      </XStack>
      <YStack height={10} backgroundColor="$secondary" borderRadius={5} overflow="hidden">
        <YStack height={10} backgroundColor="$primary" borderRadius={5} width={`${progress}%`} />
      </YStack>
    </YStack>
  );
}
