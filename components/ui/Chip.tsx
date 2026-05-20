import { X } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { Text, XStack } from 'tamagui';

interface Props {
  label: string;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

export default function Chip({ label, icon, onRemove }: Props) {
  return (
    <XStack
      alignItems="center"
      gap="$1.5"
      paddingHorizontal="$3"
      paddingVertical="$1.5"
      backgroundColor="$accent"
      borderRadius={20}
    >
      {icon}
      <Text color="$accentForeground" fontSize={13}>
        {label}
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <X size={12} color="$accentForeground" />
        </Pressable>
      )}
    </XStack>
  );
}
