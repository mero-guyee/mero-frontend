import { Plane } from '@tamagui/lucide-icons';
import { FilledButton } from './BaseButton';

export default function PlusButton({ onPress }: { onPress: () => void }) {
  return (
    <FilledButton onPress={onPress}>
      <Plane strokeWidth={1.8} size={24} color="$foreground" />
    </FilledButton>
  );
}
