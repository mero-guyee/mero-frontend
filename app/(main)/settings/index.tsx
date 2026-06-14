import { YCard } from '@/components/ui/Card';
import FadeWrapper from '@/components/ui/FadeWrapper';
import TabScreenHeader from '@/components/ui/header/TabScreenHeader';
import {
  Bell,
  ChevronRight,
  Cloud,
  Globe,
  HelpCircle,
  Info,
  Lock,
  Tag,
  User,
} from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { FilledButton } from '../../../components/ui';
import { useAuth } from '../../../contexts';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleManageCategories = () => {
    router.push('/settings/categories');
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert('알림', `${feature} 기능은 준비 중입니다.`);
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  const SettingItem = ({
    icon,
    label,
    onPress,
    showDivider = false,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    showDivider?: boolean;
  }) => (
    <Pressable onPress={onPress}>
      <XStack
        padding="$4"
        alignItems="center"
        gap="$3"
        borderBottomWidth={showDivider ? 1 : 0}
        borderBottomColor="$border"
        style={{ borderBottomColor: 'rgba(155, 196, 209, 0.2)' }}
      >
        {icon}
        <Text flex={1} color="$foreground">
          {label}
        </Text>
        <ChevronRight size={20} color="$mutedForeground" />
      </XStack>
    </Pressable>
  );

  return (
    <YStack flex={1} backgroundColor="$background" pb={insets.bottom}>
      {/* Header */}
      <TabScreenHeader label="설정" />

      <FadeWrapper>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          {/* Account Section */}
          <YStack marginBottom="$6">
            <Text color="$mutedForeground" marginBottom="$3">
              계정
            </Text>
            <YCard borderRadius="$4">
              <SettingItem
                icon={<User size={20} color="$foreground" />}
                label="프로필 설정"
                onPress={() => handleComingSoon('프로필 설정')}
              />
            </YCard>
          </YStack>

          {/* Data Section */}
          <YStack marginBottom="$6">
            <Text color="$mutedForeground" marginBottom="$3">
              데이터
            </Text>
            <YCard borderRadius="$4">
              <SettingItem
                icon={<Cloud size={20} color="$foreground" />}
                label="동기화"
                onPress={() => router.push('/settings/sync')}
              />
            </YCard>
          </YStack>

          {/* Expense Section */}
          <YStack marginBottom="$6">
            <Text color="$mutedForeground" marginBottom="$3">
              경비
            </Text>
            <YCard borderRadius="$4">
              <SettingItem
                icon={<Tag size={20} color="$foreground" />}
                label="카테고리 관리"
                onPress={handleManageCategories}
              />
            </YCard>
          </YStack>

          {/* General Section */}
          <YStack marginBottom="$6">
            <Text color="$mutedForeground" marginBottom="$3">
              일반
            </Text>
            <YCard borderRadius="$4">
              <SettingItem
                icon={<Globe size={20} color="$foreground" />}
                label="언어 설정"
                onPress={() => handleComingSoon('언어 설정')}
                showDivider
              />
              <SettingItem
                icon={<Bell size={20} color="$foreground" />}
                label="알림 설정"
                onPress={() => handleComingSoon('알림 설정')}
              />
            </YCard>
          </YStack>

          {/* Security Section */}
          <YStack marginBottom="$6">
            <Text color="$mutedForeground" marginBottom="$3">
              보안
            </Text>
            <YCard borderRadius="$4">
              <SettingItem
                icon={<Lock size={20} color="$foreground" />}
                label="개인정보 보호"
                onPress={() => handleComingSoon('개인정보 보호')}
              />
            </YCard>
          </YStack>

          {/* Support Section */}
          <YStack marginBottom="$6">
            <Text color="$mutedForeground" marginBottom="$3">
              지원
            </Text>
            <YCard borderRadius="$4">
              <SettingItem
                icon={<HelpCircle size={20} color="$foreground" />}
                label="도움말"
                onPress={() => handleComingSoon('도움말')}
                showDivider
              />
              <SettingItem
                icon={<Info size={20} color="$foreground" />}
                label="앱 정보"
                onPress={() => handleComingSoon('앱 정보')}
              />
            </YCard>
          </YStack>

          {/* Logout Button */}
          <FilledButton
            backgroundColor="$destructive"
            pressStyle={{ opacity: 0.8 }}
            marginTop="$4"
            onPress={handleLogout}
          >
            <Text color="white" fontWeight="500">
              로그아웃
            </Text>
          </FilledButton>

          {/* Version */}
          <Text textAlign="center" color="$mutedForeground" marginTop="$6">
            Version 1.0.0
          </Text>
        </ScrollView>
      </FadeWrapper>
    </YStack>
  );
}
