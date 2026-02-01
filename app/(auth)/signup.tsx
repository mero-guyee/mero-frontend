import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Alert } from 'react-native';
import { YStack, XStack, Text, Input, Button, Select, Adapt, Sheet } from 'tamagui';
import { ArrowLeft, Mail, Lock, User, DollarSign, Globe, Check, ChevronDown } from '@tamagui/lucide-icons';
import { useAuth } from '../../contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CURRENCIES = [
  { value: 'KRW', label: '🇰🇷 원 (KRW)' },
  { value: 'USD', label: '🇺🇸 달러 (USD)' },
  { value: 'EUR', label: '🇪🇺 유로 (EUR)' },
  { value: 'JPY', label: '🇯🇵 엔 (JPY)' },
  { value: 'CNY', label: '🇨🇳 위안 (CNY)' },
  { value: 'GBP', label: '🇬🇧 파운드 (GBP)' },
  { value: 'AUD', label: '🇦🇺 호주 달러 (AUD)' },
  { value: 'CAD', label: '🇨🇦 캐나다 달러 (CAD)' },
];

const TIMEZONES = [
  { value: 'Asia/Seoul', label: '서울 (KST, UTC+9)' },
  { value: 'Asia/Tokyo', label: '도쿄 (JST, UTC+9)' },
  { value: 'Asia/Shanghai', label: '상하이 (CST, UTC+8)' },
  { value: 'Asia/Hong_Kong', label: '홍콩 (HKT, UTC+8)' },
  { value: 'Asia/Singapore', label: '싱가포르 (SGT, UTC+8)' },
  { value: 'Asia/Bangkok', label: '방콕 (ICT, UTC+7)' },
  { value: 'Asia/Dubai', label: '두바이 (GST, UTC+4)' },
  { value: 'Europe/London', label: '런던 (GMT, UTC+0)' },
  { value: 'Europe/Paris', label: '파리 (CET, UTC+1)' },
  { value: 'America/New_York', label: '뉴욕 (EST, UTC-5)' },
  { value: 'America/Los_Angeles', label: 'LA (PST, UTC-8)' },
  { value: 'America/Chicago', label: '시카고 (CST, UTC-6)' },
  { value: 'Australia/Sydney', label: '시드니 (AEDT, UTC+11)' },
];

// 원본 SignUpScreen.tsx 변환
export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [currency, setCurrency] = useState('KRW');
  const [timezone, setTimezone] = useState('Asia/Seoul');

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    // Mock sign up - just proceed
    setIsAuthenticated(true);
    router.replace('/(main)/trips');
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
            <Button
              size="$4"
              circular
              backgroundColor="$card"
              pressStyle={{ backgroundColor: '$muted' }}
              onPress={handleBackToLogin}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <ArrowLeft size={20} color="$foreground" />
            </Button>
            <Text marginLeft="$4" fontSize={20} fontWeight="600" color="$foreground">
              회원가입
            </Text>
          </XStack>

          {/* Sign up form card */}
          <YStack
            backgroundColor="$card"
            borderRadius="$6"
            padding="$6"
            style={{
              shadowColor: '#5C4033',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
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

            {/* Currency - 간단한 드롭다운으로 대체 */}
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
                  {CURRENCIES.find(c => c.value === currency)?.label || currency}
                </Text>
                <ChevronDown size={20} color="$mutedForeground" />
              </XStack>
            </YStack>

            {/* Timezone - 간단한 드롭다운으로 대체 */}
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
                  {TIMEZONES.find(t => t.value === timezone)?.label || timezone}
                </Text>
                <ChevronDown size={20} color="$mutedForeground" />
              </XStack>
            </YStack>

            {/* Submit button */}
            <Button
              height={48}
              backgroundColor="$accent"
              borderRadius="$4"
              pressStyle={{ backgroundColor: '$accentHover' }}
              onPress={handleSubmit}
            >
              <Text color="$foreground" fontWeight="600" fontSize={16}>
                가입하기
              </Text>
            </Button>
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
