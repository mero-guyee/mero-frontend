import { IconButton } from '@/components/ui/button/BaseButton';
import { ArrowLeft, ChevronDown, DollarSign, Globe, Lock, Mail, User } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { authApi, Currency, Timezone } from '../../api';
import { FilledButton, Input } from '../../components/ui';
import { useAuth } from '../../contexts';

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'KRW', label: '🇰🇷 원 (KRW)' },
  { value: 'USD', label: '🇺🇸 달러 (USD)' },
  { value: 'EUR', label: '🇪🇺 유로 (EUR)' },
  { value: 'JPY', label: '🇯🇵 엔 (JPY)' },
  { value: 'CNY', label: '🇨🇳 위안 (CNY)' },
  { value: 'GBP', label: '🇬🇧 파운드 (GBP)' },
  { value: 'AUD', label: '🇦🇺 호주 달러 (AUD)' },
  { value: 'CAD', label: '🇨🇦 캐나다 달러 (CAD)' },
];

const TIMEZONES: { value: Timezone; label: string }[] = [
  { value: 'ASIA_SEOUL', label: '서울 (KST, UTC+9)' },
  { value: 'ASIA_TOKYO', label: '도쿄 (JST, UTC+9)' },
  { value: 'ASIA_SHANGHAI', label: '상하이 (CST, UTC+8)' },
  { value: 'ASIA_HONG_KONG', label: '홍콩 (HKT, UTC+8)' },
  { value: 'ASIA_SINGAPORE', label: '싱가포르 (SGT, UTC+8)' },
  { value: 'ASIA_BANGKOK', label: '방콕 (ICT, UTC+7)' },
  { value: 'ASIA_DUBAI', label: '두바이 (GST, UTC+4)' },
  { value: 'EUROPE_LONDON', label: '런던 (GMT, UTC+0)' },
  { value: 'EUROPE_PARIS', label: '파리 (CET, UTC+1)' },
  { value: 'AMERICA_NEW_YORK', label: '뉴욕 (EST, UTC-5)' },
  { value: 'AMERICA_LOS_ANGELES', label: 'LA (PST, UTC-8)' },
  { value: 'AMERICA_CHICAGO', label: '시카고 (CST, UTC-6)' },
  { value: 'AUSTRALIA_SYDNEY', label: '시드니 (AEDT, UTC+11)' },
];

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [defaultCurrency] = useState<Currency>('KRW');
  const [timezone] = useState<Timezone>('ASIA_SEOUL');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      await authApi.signup({ email, password, nickname, defaultCurrency, timezone });
      setIsAuthenticated(true);
      Alert.alert('회원가입 성공');
      router.replace('/(main)/trips');
    } catch (e: any) {
      Alert.alert('회원가입 실패', e?.message ?? '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <YStack width="100%" maxWidth={400} alignSelf="center">
          {/* Header */}
          <XStack alignItems="center" marginBottom="$6" marginTop="$4">
            <IconButton onPress={handleBackToLogin}>
              <ArrowLeft size={20} color="$foreground" />
            </IconButton>
            <Text marginLeft="$4" fontSize={20} fontWeight="600" color="$foreground">
              회원가입
            </Text>
          </XStack>

          {/* Sign up form card */}
          <YStack backgroundColor="$card" borderRadius="$6" padding="$6">
            {/* Email */}
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

            {/* Password */}
            <YStack marginBottom="$5">
              <Text fontSize={14} color="$foreground" marginBottom="$2" fontWeight="500">
                비밀번호
              </Text>
              <XStack
                backgroundColor="$inputBackground"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$border"
                alignItems="center"
                paddingLeft="$4"
              >
                <Lock size={20} color="$mutedForeground" />
                <Input
                  flex={1}
                  height={48}
                  backgroundColor="transparent"
                  borderWidth={0}
                  placeholder="8자 이상 입력"
                  placeholderTextColor="$mutedForeground"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </XStack>
            </YStack>

            {/* Confirm Password */}
            <YStack marginBottom="$5">
              <Text fontSize={14} color="$foreground" marginBottom="$2" fontWeight="500">
                비밀번호 확인
              </Text>
              <XStack
                backgroundColor="$inputBackground"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$border"
                alignItems="center"
                paddingLeft="$4"
              >
                <Lock size={20} color="$mutedForeground" />
                <Input
                  flex={1}
                  height={48}
                  backgroundColor="transparent"
                  borderWidth={0}
                  placeholder="비밀번호 재입력"
                  placeholderTextColor="$mutedForeground"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </XStack>
            </YStack>

            {/* Nickname */}
            <YStack marginBottom="$5">
              <Text fontSize={14} color="$foreground" marginBottom="$2" fontWeight="500">
                닉네임
              </Text>
              <XStack
                backgroundColor="$inputBackground"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$border"
                alignItems="center"
                paddingLeft="$4"
              >
                <User size={20} color="$mutedForeground" />
                <Input
                  flex={1}
                  height={48}
                  backgroundColor="transparent"
                  borderWidth={0}
                  placeholder="여행자"
                  placeholderTextColor="$mutedForeground"
                  value={nickname}
                  onChangeText={setNickname}
                />
              </XStack>
            </YStack>

            {/* Default Currency */}
            <YStack marginBottom="$5">
              <Text fontSize={14} color="$foreground" marginBottom="$2" fontWeight="500">
                기본 통화
              </Text>
              <XStack
                backgroundColor="$inputBackground"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$border"
                alignItems="center"
                paddingLeft="$4"
                paddingRight="$3"
                height={48}
              >
                <DollarSign size={20} color="$mutedForeground" />
                <Text flex={1} marginLeft="$3" color="$foreground">
                  {CURRENCIES.find((c) => c.value === defaultCurrency)?.label || defaultCurrency}
                </Text>
                <ChevronDown size={20} color="$mutedForeground" />
              </XStack>
            </YStack>

            {/* Timezone */}
            <YStack marginBottom="$6">
              <Text fontSize={14} color="$foreground" marginBottom="$2" fontWeight="500">
                타임존
              </Text>
              <XStack
                backgroundColor="$inputBackground"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$border"
                alignItems="center"
                paddingLeft="$4"
                paddingRight="$3"
                height={48}
              >
                <Globe size={20} color="$mutedForeground" />
                <Text flex={1} marginLeft="$3" color="$foreground" numberOfLines={1}>
                  {TIMEZONES.find((t) => t.value === timezone)?.label || timezone}
                </Text>
                <ChevronDown size={20} color="$mutedForeground" />
              </XStack>
            </YStack>

            {/* Submit button */}
            <FilledButton onPress={handleSubmit} disabled={loading} opacity={loading ? 0.6 : 1}>
              <Text color="$foreground" fontWeight="600" fontSize={16}>
                {loading ? '가입 중...' : '가입하기'}
              </Text>
            </FilledButton>
          </YStack>

          {/* Terms */}
          <Text
            fontSize={12}
            color="$mutedForeground"
            textAlign="center"
            marginTop="$6"
            paddingHorizontal="$4"
          >
            회원가입 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </Text>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
