import { Compass } from '@tamagui/lucide-icons';
import { EmptyState } from '../ui';

interface TripEmptyStateProps {
  onCreateTrip: () => void;
}

export function TripEmptyState({ onCreateTrip }: TripEmptyStateProps) {
  return (
    <EmptyState
      icon={<Compass size={32} color="$mutedForeground" />}
      title="첫 여정을 시작해보세요"
      description="새로운 모험의 기록을 남겨보세요"
      action={{ label: '여정 만들기', onPress: onCreateTrip }}
    />
  );
}
