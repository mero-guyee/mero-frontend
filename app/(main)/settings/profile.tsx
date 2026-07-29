import { FilledButton, Input } from '@/components/ui';
import FormLabel from '@/components/ui/form/FormLabel';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import ImagePickerSheet from '@/components/ui/ImagePickerSheet';
import { useUpdateNickname, useUpdateProfileImage, useUserQuery } from '@/hooks/queries/useUser';
import { Camera } from '@tamagui/lucide-icons';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Text, XStack, YStack } from 'tamagui';

const DEFAULT_AVATAR = Asset.fromModule(require('@/assets/images/default-avatar.png')).uri;

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: user } = useUserQuery();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const updateNickname = useUpdateNickname();
  const updateProfileImage = useUpdateProfileImage();

  useEffect(() => {
    if (user) setNickname(user.nickname ?? '');
  }, [user]);

  const handleSelectImage = (uri: string) => {
    updateProfileImage.mutate(uri, {
      onError: () => {
        Toast.show({
          type: 'error',
          text1: '오류',
          text2: '프로필 이미지를 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      },
    });
  };

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (trimmed === user?.nickname) {
      router.back();
      return;
    }

    updateNickname.mutate(trimmed, {
      onSuccess: () => router.back(),
      onError: (e) => {
        Toast.show({
          type: 'error',
          text1: '오류',
          text2: '닉네임을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      },
    });
  };

  return (
    <YStack flex={1} backgroundColor="$background" pb={insets.bottom}>
      <BackActionHeader onBack={() => router.back()} label="프로필 설정" />

      <YStack padding="$4" flex={1} justifyContent="space-between">
        <YStack>
          <XStack justifyContent="center" marginBottom="$4">
            <YStack width={88} height={88}>
              <YStack
                testID="profile-image-button"
                onPress={() => setPickerOpen(true)}
                width={88}
                height={88}
                backgroundColor="$accent"
                borderRadius={44}
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
                opacity={updateProfileImage.isPending ? 0.6 : 1}
              >
                <Image
                  source={{ uri: user?.profileImage ?? DEFAULT_AVATAR }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  style={{ width: 88, height: 88 }}
                />
              </YStack>

              <YStack
                position="absolute"
                bottom={0}
                right={0}
                width={28}
                height={28}
                borderRadius={14}
                backgroundColor="$foreground"
                borderWidth={2}
                borderColor="$background"
                alignItems="center"
                justifyContent="center"
                pointerEvents="none"
              >
                <Camera size={14} color="$background" />
              </YStack>
            </YStack>
          </XStack>

          <FormLabel marginBottom="$2">닉네임</FormLabel>
          <Input
            testID="profile-nickname-input"
            borderColor={error ? '$destructiveText' : '$foreground'}
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
          <Text color="$destructiveText" fontSize={13} marginTop="$1" minHeight={14}>
            {error ?? ''}
          </Text>
        </YStack>

        <FilledButton
          onPress={handleSubmit}
          disabled={updateNickname.isPending || !nickname.trim()}
          opacity={updateNickname.isPending || !nickname.trim() ? 0.6 : 1}
        >
          <Text color="$foreground" fontWeight="600" fontSize={16}>
            저장
          </Text>
        </FilledButton>
      </YStack>

      <ImagePickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelectImage}
        aspect={[1, 1]}
      />
    </YStack>
  );
}
