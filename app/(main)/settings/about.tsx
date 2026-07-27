import { YCard } from '@/components/ui/Card';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { ChevronRight, FileText } from '@tamagui/lucide-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Image, Linking, Pressable, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

const PRIVACY_POLICY_URL = 'https://ming-page.notion.site/39549882e511808d98a8e3d5e748cb24';

export default function AboutScreen() {
  const router = useRouter();

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber;

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader onBack={() => router.back()} label="앱 정보" />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <YStack alignItems="center" marginBottom="$6" gap="$3">
          <Image
            source={require('@/assets/icon.png')}
            style={{ width: 72, height: 72, borderRadius: 16 }}
          />
          <YStack alignItems="center" gap="$1">
            <Text color="$foreground" fontSize="$6" fontWeight="600">
              메로
            </Text>
            <Text color="$mutedForeground">
              버전 {version}
              {buildNumber ? ` (${buildNumber})` : ''}
            </Text>
          </YStack>
        </YStack>

        <YStack marginBottom="$6">
          <Text color="$mutedForeground" marginBottom="$3">
            약관
          </Text>
          <YCard>
            <Pressable onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
              <XStack padding="$4" alignItems="center" gap="$3">
                <FileText size={20} color="$foreground" />
                <Text flex={1} color="$foreground">
                  개인정보처리방침
                </Text>
                <ChevronRight size={20} color="$mutedForeground" />
              </XStack>
            </Pressable>
          </YCard>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
