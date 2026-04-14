import { Plane } from '@tamagui/lucide-icons';
import { View } from 'tamagui';

export default function Loading() {
  return (
    <View flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
      <Plane size={44} color="$mutedForeground" />
    </View>
  );
}
