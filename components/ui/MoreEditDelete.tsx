import { Pencil, Trash2 } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { Text, XStack } from 'tamagui';
import More from './More';

export default function MoreEditDelete({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <More>
      <Pressable onPress={onEdit}>
        <XStack paddingHorizontal="$4" paddingVertical="$4" gap="$2" alignItems="center">
          <Pencil size={16} color="$foreground" />
          <Text color="$foreground">수정</Text>
        </XStack>
      </Pressable>
      <Pressable onPress={onDelete}>
        <XStack paddingHorizontal="$4" paddingVertical="$4" gap="$2" alignItems="center">
          <Trash2 size={16} color="$destructive" />
          <Text color="$destructive">삭제</Text>
        </XStack>
      </Pressable>
    </More>
  );
}
