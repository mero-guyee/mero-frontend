import { FilledButton, Input } from '@/components/ui';
import { useAppModal } from '@/contexts';
import { useCompleteOnboarding } from '@/hooks/queries/useUser';
import { Plane } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatePresence, Text, XStack, YStack } from 'tamagui';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const completeOnboarding = useCompleteOnboarding();
  const { showAlert } = useAppModal();

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    completeOnboarding.mutate(trimmed, {
      onSuccess: () => router.replace('/(main)/trips'),
      onError: () =>
        showAlert('오류', '닉네임을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.'),
    });
  };

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingVertical={24 + insets.top}
      paddingHorizontal="$5"
    >
      <YStack>
        <Text fontSize={22} fontWeight="700" color="$foreground" marginBottom="$4">
          여행자님의 이름을 알려주세요
        </Text>

        <Input
          testID="onboarding-nickname-input"
          borderColor={error ? '$destructiveText' : '$foreground'}
          paddingHorizontal="$4"
          paddingVertical="$3"
          placeholder="이름"
          placeholderTextColor="$placeholderForeground"
          value={nickname}
          onChangeText={(text) => {
            setNickname(text);
            if (error) setError(null);
          }}
          color="$foreground"
        />
        <Text color="$destructiveText" fontSize={13} marginTop="$1" minHeight={14}>
          {error ?? ''}
        </Text>

        <AnimatePresence>
          {nickname.trim() && (
            <FilledButton
              key="start-btn"
              animation="fast"
              enterStyle={{ opacity: 0, scale: 0.95 }}
              exitStyle={{ opacity: 0, scale: 0.95 }}
              onPress={handleSubmit}
              disabled={completeOnboarding.isPending}
              opacity={completeOnboarding.isPending ? 0.6 : 1}
            >
              <XStack alignItems="center" justifyContent="center" gap="$2">
                <Text color="$foreground" fontWeight="600" fontSize={16}>
                  시작하기
                </Text>
                <Plane size={18} color="$foreground" />
              </XStack>
            </FilledButton>
          )}
        </AnimatePresence>
      </YStack>
    </YStack>
  );
}
