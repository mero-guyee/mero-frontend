import { Memo } from '@/types';
import { Trash2 } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

export default function MemoCard({
  memo,
  onPress,
  onDelete,
}: {
  memo: Memo;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { id, title, content } = memo;
  return (
    <Pressable key={id} onPress={() => onPress(memo.id)}>
      <YStack
        backgroundColor="$card"
        borderRadius="$6"
        padding="$4"
        borderWidth={1}
        borderColor="$border"
      >
        <XStack alignItems="flex-start" justifyContent="space-between" marginBottom="$2">
          <Text color="$foreground" fontWeight="500" flex={1} paddingRight="$2">
            {title}
          </Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDelete(memo.id);
            }}
            style={{ padding: 8, marginRight: -8, marginTop: -8 }}
          >
            <Trash2 size={16} color="$destructive" />
          </Pressable>
        </XStack>
        <Text color="$mutedForeground" fontSize={14} numberOfLines={2} marginBottom="$2">
          {content}
        </Text>
      </YStack>
    </Pressable>
  );
}
