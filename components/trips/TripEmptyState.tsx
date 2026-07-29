import { EmptyState } from '../ui';

interface TripEmptyStateProps {
  onCreateTrip: () => void;
}

export function TripEmptyState({ onCreateTrip }: TripEmptyStateProps) {
  return (
    <EmptyState
      title="첫 여정을 시작해보세요"
      action={{ label: '여정 만들기', onPress: onCreateTrip }}
    />
  );
}
