import { YCard } from '@/components/ui/Card';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { SyncingResultBadge } from '@/components/ui/SyncingResultBadge';
import { useSyncContext } from '@/contexts';
import { Memo } from '@/types';
import { Trash2 } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { Text, XStack } from 'tamagui';

export default function MemoCard({
  memo,
  onPress,
  onDelete,
}: {
  memo: Memo;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { isSyncing } = useSyncContext();
  const { id, title, content, syncStatus } = memo;
  return (
    <Pressable key={id} onPress={() => onPress(memo.id)}>
      <YCard padding="$4" position="relative">
        <SyncingResultBadge id={id} status={syncStatus} />
        <XStack alignItems="flex-start" justifyContent="space-between" marginBottom="$2">
          <XStack flex={1} paddingRight="$2" gap="$1">
            <Text color="$foreground" fontWeight="500">
              {title}
            </Text>
            <SyncIndicator status={syncStatus} syncing={isSyncing(id)} />
          </XStack>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDelete(memo.id);
            }}
            style={{ padding: 8, marginRight: -8, marginTop: -8, zIndex: 1 }}
          >
            <Trash2 size={16} color="$destructive" />
          </Pressable>
        </XStack>
        <Text color="$mutedForeground" fontSize={14} numberOfLines={2} marginBottom="$2">
          {content}
        </Text>
      </YCard>
    </Pressable>
  );
}
