import { FilledButton } from '@/components/ui';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { clearDebugLogs, getDebugLogs } from '@/utils/debugLog';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Text, YStack } from 'tamagui';

export default function DebugLogsScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState(() => getDebugLogs());

  const handleCopyAll = async () => {
    await Clipboard.setStringAsync(logs.join('\n'));
    Toast.show({
      type: 'info',
      text1: '복사됨',
      text2: `${logs.length}줄 클립보드에 복사했습니다`,
    });
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader onBack={() => router.back()} label={`디버그 로그 (${logs.length})`} />
      <YStack flexDirection="row" gap="$2" padding="$3">
        <FilledButton flex={1} onPress={() => setLogs([...getDebugLogs()])}>
          <Text>새로고침</Text>
        </FilledButton>
        <FilledButton flex={1} onPress={handleCopyAll}>
          <Text>전체 복사</Text>
        </FilledButton>
        <FilledButton
          flex={1}
          backgroundColor="$destructive"
          onPress={() => {
            clearDebugLogs();
            setLogs([]);
          }}
        >
          <Text color="white">지우기</Text>
        </FilledButton>
      </YStack>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text selectable fontSize={11} color="$foreground">
          {logs.length === 0 ? '로그 없음' : logs.join('\n')}
        </Text>
      </ScrollView>
    </YStack>
  );
}
