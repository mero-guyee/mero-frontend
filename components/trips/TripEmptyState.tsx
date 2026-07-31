import { EmptyState } from '../ui';
import MeroGlobeSpinner from '../ui/MeroGlobeSpinner';

interface TripEmptyStateProps {
  onCreateTrip: () => void;
}

export function TripEmptyState({ onCreateTrip }: TripEmptyStateProps) {
  return (
    <EmptyState
      icon={<MeroGlobeSpinner />}
      title="어디로 떠나볼까요?"
      description="가고 싶은 나라부터 골라보세요"
      action={{ label: '나라 고르기', onPress: onCreateTrip }}
    />
  );
}
