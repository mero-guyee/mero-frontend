import { FolderOpen } from '@tamagui/lucide-icons';
import { Text, YStack } from 'tamagui';

export default function EmptyDocuments() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$20" gap="$3">
      <YStack
        width={72}
        height={72}
        backgroundColor="$accent"
        borderRadius={36}
        alignItems="center"
        justifyContent="center"
        opacity={0.5}
      >
        <FolderOpen size={32} color="$mutedForeground" />
      </YStack>
      <YStack alignItems="center" gap="$1">
        <Text fontSize={16} fontWeight="600" color="$foreground">
          저장된 서류가 없어요
        </Text>
        <Text fontSize={13} color="$mutedForeground" textAlign="center">
          항공권, 예약 확인서 등을 보관해보세요
        </Text>
      </YStack>
    </YStack>
  );
}
