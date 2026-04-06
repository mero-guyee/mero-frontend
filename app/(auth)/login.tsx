import { Compass, Mail } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Separator, Text, XStack, YStack } from 'tamagui';
import { naverApi } from '../../api';
import { FilledButton, Input } from '../../components/ui';
import { useAuth } from '../../contexts';

const DEEP_LINK = 'mero://auth/naver/callback';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      await login({ email, password });
    } catch (e: any) {
      Alert.alert('로그인 실패', e?.message ?? '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    const { authUrl } = await naverApi.getAuthUrl();

    const result = await WebBrowser.openAuthSessionAsync(authUrl, DEEP_LINK);

    if (result.type === 'success') {
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');
      if (code && returnedState) {
        try {
          const { naverNickname } = await naverApi.connect({ code, state: returnedState });
          Alert.alert(`환영합니다, ${naverNickname}님. 새로운 모험을 시작해보시죠.`);
        } catch (e) {
          Alert.alert('네이버 로그인 실패', '네이버 로그인 과정에서 오류가 발생했습니다.');
          return;
        }
      }
    } else if (result.type === 'cancel') {
      Alert.alert('취소', '네이버 로그인이 취소되었습니다.');
    }
  };

  const handleAppleLogin = () => {
    // Apple 로그인 미구현
    Alert.alert('알림', 'Apple 로그인은 준비 중입니다.');
  };

  const handleSignUpClick = () => {
    router.push('/(auth)/signup');
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
        <YStack alignItems="center" marginBottom="$10">
          <YStack
            width={64}
            height={64}
            backgroundColor="$primary"
            borderRadius={32}
            alignItems="center"
            justifyContent="center"
            marginBottom="$4"
          >
            <Compass size={32} color="white" />
          </YStack>
          <Text fontSize={40} fontWeight="700" color="$foreground" marginBottom="$1">
            유랑자의 기록
          </Text>
          <Text fontSize={18} color="$mutedForeground">
            당신의 이야기를 기록하세요
          </Text>
        </YStack>

        {/* Login form card */}
        <YStack backgroundColor="$card" borderRadius="$6" padding="$6" marginBottom="$6">
          {/* Email Input */}
          <YStack marginBottom="$5">
            <Text fontSize={14} color="$foreground" marginBottom="$2" fontWeight="500">
              이메일
            </Text>
            <XStack
              backgroundColor="$inputBackground"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$border"
              alignItems="center"
              paddingLeft="$4"
            >
              <Mail size={20} color="$mutedForeground" />
              <Input
                flex={1}
                height={48}
                backgroundColor="transparent"
                borderWidth={0}
                placeholder="your@email.com"
                placeholderTextColor="$mutedForeground"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </XStack>
          </YStack>

          {/* Password Input */}
          <YStack marginBottom="$5">
            <Text fontSize={14} color="$foreground" marginBottom="$2" fontWeight="500">
              비밀번호
            </Text>
            <Input
              height={48}
              backgroundColor="$inputBackground"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$border"
              placeholder="••••••••"
              placeholderTextColor="$mutedForeground"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </YStack>

          {/* Login Button */}
          <FilledButton onPress={handleEmailLogin} disabled={loading} opacity={loading ? 0.6 : 1}>
            <Text color="$foreground" fontWeight="600" fontSize={16}>
              {loading ? '로그인 중...' : '로그인'}
            </Text>
          </FilledButton>

          {/* Divider */}
          <XStack alignItems="center" marginVertical="$6">
            <Separator flex={1} />
            <Text paddingHorizontal="$4" color="$mutedForeground" fontSize={12}>
              또는
            </Text>
            <Separator flex={1} />
          </XStack>
          {/* Apple Login */}
          <FilledButton onPress={handleAppleLogin}>
            <XStack alignItems="center" gap="$2">
              <Text fontSize={20}></Text>
              <Text color="$foreground" fontWeight="600" fontSize={16}>
                Apple로 로그인
              </Text>
            </XStack>
          </FilledButton>
        </YStack>

        {/* Sign up link */}
        <XStack justifyContent="center" gap="$1">
          <Text fontSize={14} color="$mutedForeground">
            계정이 없으신가요?
          </Text>
          <Text fontSize={14} color="$primary" fontWeight="600" onPress={handleSignUpClick}>
            회원가입
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
