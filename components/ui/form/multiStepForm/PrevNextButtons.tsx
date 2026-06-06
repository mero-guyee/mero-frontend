import { router } from 'expo-router';
import { Spinner, XStack } from 'tamagui';
import { FilledButton } from '../../button/BaseButton';

export default function PrevNextButtons({
  isFirst = false,
  isLast = false,
  onPrev,
  onNext,
  isNextLoading = false,
}: {
  isFirst?: boolean;
  isLast?: boolean;
  onPrev?: () => void;
  onNext: () => void;
  isNextLoading?: boolean;
}) {
  return (
    <XStack columnGap="$3.5" mt="$3.5">
      <FilledButton flex={1} backgroundColor="$muted" onPress={onPrev || (() => router.back())} disabled={isNextLoading}>
        {isFirst ? '취소' : '이전'}
      </FilledButton>
      <FilledButton flex={1} onPress={onNext} disabled={isNextLoading} icon={isNextLoading ? <Spinner /> : undefined}>
        {isNextLoading ? null : (isLast ? '완료' : '다음')}
      </FilledButton>
    </XStack>
  );
}
