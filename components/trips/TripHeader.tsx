import { paddingHorizontalGeneral } from '@/constants/theme';
import { TripStatus } from '@/types';
import { Backpack, Plus, Settings } from '@tamagui/lucide-icons';
import { Text, XStack, YStack } from 'tamagui';
import { CircularButton, FilledButton } from '../ui';
import { TripFilters } from './TripFilters';

type FilterType = 'all' | TripStatus;
type SortType = 'newest' | 'oldest';

interface TripHeaderProps {
  onSettings: () => void;
  onCreateTrip: () => void;
  filter: FilterType;
  sort: SortType;
  setFilter: (filter: FilterType) => void;
  setSort: (sort: SortType) => void;
}

export function TripHeader({
  filter,
  sort,
  setFilter,
  setSort,
  onSettings,
  onCreateTrip,
}: TripHeaderProps) {
  return (
    <YStack
      backgroundColor="$card"
      borderBottomWidth={2}
      borderBottomColor="$border"
      padding={paddingHorizontalGeneral}
      rowGap="$3"
    >
      <XStack alignItems="center" justifyContent="space-between">
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
            <Settings size="$7" color="$foreground" />
          </CircularButton>
          <FilledButton
            backgroundColor="$accent"
            pressStyle={{ backgroundColor: '$accentHover' }}
            onPress={onCreateTrip}
          >
            <Plus size={20} color="$foreground" />
          </FilledButton>
        </XStack>
      </XStack>
      <TripFilters filter={filter} sort={sort} onFilterChange={setFilter} onSortChange={setSort} />
    </YStack>
  );
}
