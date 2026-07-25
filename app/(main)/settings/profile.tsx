import { FilledButton, Input } from '@/components/ui';
import FormLabel from '@/components/ui/form/FormLabel';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { useUpdateNickname, useUserQuery } from '@/hooks/queries/useUser';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack } from 'tamagui';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: user } = useUserQuery();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const updateNickname = useUpdateNickname();

  useEffect(() => {
    if (user) setNickname(user.nickname);
  }, [user]);

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    updateNickname.mutate(trimmed, {
      onSuccess: () => router.back(),
      onError: (e) => {
        console.log(e);
        Alert.alert('오류', '닉네임을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      },
    });
  };

  return (
    <YStack flex={1} backgroundColor="$background" pb={insets.bottom}>
      <BackActionHeader onBack={() => router.back()} label="프로필 설정" />

      <YStack padding="$4" flex={1} justifyContent="space-between">
        <YStack>
          <FormLabel marginBottom="$2">닉네임</FormLabel>
          <Input
            testID="profile-nickname-input"
            borderColor={error ? '$destructive' : '$foreground'}
            paddingHorizontal="$4"
            paddingVertical="$3"
            placeholder="닉네임을 입력하세요"
            placeholderTextColor="$placeholderForeground"
            value={nickname}
            onChangeText={(text) => {
              setNickname(text);
              if (error) setError(null);
            }}
            color="$foreground"
          />
          <Text color="$destructive" fontSize={13} marginTop="$1" minHeight={14}>
            {error ?? ''}
          </Text>
        </YStack>

        <FilledButton
          onPress={handleSubmit}
          disabled={updateNickname.isPending}
          opacity={updateNickname.isPending ? 0.6 : 1}
        >
          <Text color="$foreground" fontWeight="600" fontSize={16}>
            저장
          </Text>
        </FilledButton>
      </YStack>
    </YStack>
  );
}
