import LoadingDots from '@/components/ui/button/Loading';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Image, Text, XStack, YStack } from 'tamagui';
import { FilledButton } from '../../components/ui';
import { useAuth } from '../../contexts';

export default function LoginScreen() {
  const { loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      Alert.alert('Google 로그인 실패', e?.message ?? '다시 시도해주세요.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleLogin = () => {
    Alert.alert('알림', 'Apple 로그인은 준비 중입니다.');
  };

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center"
      padding="$6"
    >
      <YStack width="100%" maxWidth={400}>
        {/* Header */}
        <YStack justifyContent="center" alignItems="center" marginBottom="$5">
          <Image source={require('@/assets/icon.png')} width={80} height={80} />
          <Image
            source={require('@/assets/typo.png')}
            width={300}
            height={85}
            objectFit="contain"
          />
        </YStack>

        {/* Login form card */}
        <YStack>
          {/* Google Login */}

          <FilledButton
            onPress={handleGoogleLogin}
            disabled={googleLoading}
            opacity={googleLoading ? 0.6 : 1}
            marginBottom="$3"
          >
            {googleLoading ? (
              <LoadingDots />
            ) : (
              <XStack alignItems="center" gap="$2">
                <Text fontSize={20}>G</Text>
                <Text color="$foreground" fontWeight="600" fontSize={16}>
                  Google로 로그인
                </Text>
              </XStack>
            )}
          </FilledButton>
          {/* Apple Login */}
          <FilledButton onPress={handleAppleLogin}>
            {appleLoading ? (
              <LoadingDots />
            ) : (
              <XStack alignItems="center" gap="$2">
                <Text fontSize={20}></Text>
                <Text color="$foreground" fontWeight="600" fontSize={16}>
                  Apple로 로그인
                </Text>
              </XStack>
            )}
          </FilledButton>
        </YStack>
      </YStack>
    </YStack>
  );
}
