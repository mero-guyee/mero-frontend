import { ClockIcon } from 'phosphor-react-native';
import { View } from 'tamagui';

type Props = {
  color: string;
  offset?: { top?: number; right?: number };
};

export default function TabLockBadge({ color, offset }: Props) {
  return (
    <View
      position="absolute"
      top={offset?.top ?? -6}
      right={offset?.right ?? -8}
      width={20}
      height={20}
      borderRadius={999}
      backgroundColor="$mutedStrong"
      alignItems="center"
      justifyContent="center"
      zIndex={2}
    >
      <ClockIcon size={13} color={color} weight="fill" />
    </View>
  );
}
