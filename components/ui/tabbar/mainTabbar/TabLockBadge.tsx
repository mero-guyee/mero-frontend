import { Lock } from 'phosphor-react-native';
import { View } from 'tamagui';

export default function TabLockBadge({ color }: { color: string }) {
  return (
    <View
      position="absolute"
      top={-6}
      right={-8}
      width={20}
      height={20}
      borderRadius={999}
      backgroundColor="$mutedStrong"
      alignItems="center"
      justifyContent="center"
      zIndex={2}
    >
      <Lock size={13} color={color} weight="fill" />
    </View>
  );
}
