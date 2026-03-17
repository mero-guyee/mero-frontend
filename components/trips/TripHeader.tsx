import { Backpack, Plus, Settings } from '@tamagui/lucide-icons';
import { Text, XStack, YStack } from 'tamagui';
import { CircularButton } from '../ui';
import { TripFilters } from './TripFilters';

type FilterType = 'all' | 'ongoing' | 'completed';
type SortType = 'newest' | 'oldest';

interface TripHeaderProps {
  onSettings: () => void;
  onCreateTrip: () => void;
  filter: FilterType;
  sort: SortType;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
}

export function TripHeader({
  onSettings,
  onCreateTrip,
  filter,
  sort,
  onFilterChange,
  onSortChange,
}: TripHeaderProps) {
  return (
    <YStack
      backgroundColor="$card"
      borderBottomWidth={2}
      borderBottomColor="$border"
      style={{
        shadowColor: '#5C4033',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <XStack alignItems="center" justifyContent="space-between" padding="$4">
        <XStack alignItems="center" gap="$3">
          <YStack
            width={48}
            height={48}
            backgroundColor="$accent"
            borderRadius={24}
            alignItems="center"
            justifyContent="center"
          >
            <Backpack size={24} color="$foreground" />
          </YStack>
          <YStack>
            <Text fontSize={18} fontWeight="600" color="$foreground">
              {}씨의 기록
            </Text>
            <Text fontSize={14} color="$mutedForeground">
              세계는 넓고 갈 곳은 많습니다
            </Text>
          </YStack>
        </XStack>
        <XStack gap="$2">
          <CircularButton pressStyle={{ backgroundColor: '$muted' }} onPress={onSettings}>
            <Settings size={20} color="$foreground" />
          </CircularButton>
          <CircularButton
            backgroundColor="$accent"
            pressStyle={{ backgroundColor: '$accentHover' }}
            onPress={onCreateTrip}
          >
            <Plus size={20} color="$foreground" />
          </CircularButton>
        </XStack>
      </XStack>

      <TripFilters
        filter={filter}
        sort={sort}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
      />
    </YStack>
  );
}
