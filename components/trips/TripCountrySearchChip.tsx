import { X } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { Text, XStack } from 'tamagui';

export default function TripCountrySearchChip({
  country,
  onRemove,
}: {
  country: string;
  onRemove: (country: string) => void;
}) {
  return (
    <XStack
      key={country}
      alignItems="center"
      gap="$1"
      paddingHorizontal="$3"
      paddingVertical="$1.5"
      backgroundColor="$accent"
      borderRadius={20}
    >
      <Text color="$accentForeground" fontSize={13}>
        {country}
      </Text>
      <Pressable onPress={() => onRemove(country)} hitSlop={8}>
        <X size={12} color="$accentForeground" />
      </Pressable>
    </XStack>
  );
}
