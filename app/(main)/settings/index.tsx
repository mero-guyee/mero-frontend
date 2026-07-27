import { YCard } from '@/components/ui/Card';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { ChevronRight, Cloud, Info, Monitor, Moon, Sun, Tag, User } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { FilledButton } from '../../../components/ui';
import { ThemeMode, useAuth, useTheme } from '../../../contexts';

const THEME_MODE_OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Monitor }[] = [
  { mode: 'system', label: '시스템 설정', Icon: Monitor },
  { mode: 'light', label: '라이트', Icon: Sun },
  { mode: 'dark', label: '다크', Icon: Moon },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();

  const handleManageCategories = () => {
    router.push('/settings/categories');
  };

  const handleProfileSettings = () => {
    router.push('/settings/profile');
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
      <BackActionHeader onBack={() => router.back()} label="설정" />

      <FadeWrapper>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          {/* Account Section */}
          <YStack marginBottom="$6">
            <Text color="$mutedForeground" marginBottom="$3">
              계정
            </Text>
            <YCard>
              <SettingItem
                icon={<User size={20} color="$foreground" />}
                label="프로필 설정"
                onPress={handleProfileSettings}
              />
            </YCard>
          </YStack>

          {/* Data Section */}
          <YStack marginBottom="$6">
            <Text color="$mutedForeground" marginBottom="$3">
              데이터
            </Text>
            <YCard>
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
            <YCard>
              <SettingItem
                icon={<Tag size={20} color="$foreground" />}
                label="카테고리 관리"
                onPress={handleManageCategories}
              />
            </YCard>
          </YStack>

          {/* Display Section */}
          <YStack marginBottom="$6">
            <Text color="$mutedForeground" marginBottom="$3">
              화면 모드
            </Text>
            <YCard>
              <XStack padding="$3" gap="$2">
                {THEME_MODE_OPTIONS.map(({ mode: optionMode, label, Icon }) => {
                  const isSelected = mode === optionMode;
                  return (
                    <Pressable
                      key={optionMode}
                      style={{ flex: 1 }}
                      onPress={() => setMode(optionMode)}
                    >
                      <YStack
                        alignItems="center"
                        gap="$1.5"
                        paddingVertical="$3"
                        borderRadius="$3"
                        backgroundColor={isSelected ? '$accent' : 'transparent'}
                      >
                        <Icon size={18} color="$foreground" />
                        <Text
                          color="$foreground"
                          fontSize={13}
                          fontWeight={isSelected ? '600' : '400'}
                        >
                          {label}
                        </Text>
                      </YStack>
                    </Pressable>
                  );
                })}
              </XStack>
            </YCard>
          </YStack>

          {/* Support Section */}
          <YStack marginBottom="$6">
            <Text color="$mutedForeground" marginBottom="$3">
              지원
            </Text>
            <YCard>
              <SettingItem
                icon={<Info size={20} color="$foreground" />}
                label="앱 정보"
                onPress={() => router.push('/settings/about')}
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
