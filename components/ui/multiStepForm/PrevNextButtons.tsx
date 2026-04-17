import { router } from 'expo-router';
import { XStack } from 'tamagui';
import { FilledButton } from '../button/BaseButton';

export default function PrevNextButtons({
  isFirst = false,
  isLast = false,
  onPrev,
  onNext,
}: {
  isFirst?: boolean;
  isLast?: boolean;
  onPrev?: () => void;
  onNext: () => void;
}) {
  return (
    <XStack columnGap="$3.5" mt="$3.5">
      <FilledButton flex={1} backgroundColor="$muted" onPress={onPrev || (() => router.back())}>
        {isFirst ? '취소' : '이전'}
      </FilledButton>
      <FilledButton flex={1} onPress={onNext}>
        {isLast ? '완료' : '다음'}
      </FilledButton>
    </XStack>
  );
}
