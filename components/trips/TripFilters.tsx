import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

type FilterType = 'all' | 'ongoing' | 'completed';
type SortType = 'newest' | 'oldest';

interface TripFiltersProps {
  filter: FilterType;
  sort: SortType;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
}

export function TripFilters({ filter, sort, onFilterChange, onSortChange }: TripFiltersProps) {
  const nextFilter: FilterType =
    filter === 'all' ? 'ongoing' : filter === 'ongoing' ? 'completed' : 'all';
  const filterLabel = filter === 'all' ? '전체' : filter === 'ongoing' ? '진행 중' : '완료됨';
  const sortLabel = sort === 'newest' ? '최신순' : '오래된 순';

  return (
    <XStack padding="$4" paddingTop={0} gap="$2">
      <YStack
        flex={1}
        backgroundColor="$muted"
        borderRadius="$4"
        borderWidth={2}
        borderColor="$border"
        paddingHorizontal="$4"
        paddingVertical="$2.5"
      >
        <Pressable onPress={() => onFilterChange(nextFilter)}>
          <Text color="$foreground" fontSize={14}>
            {filterLabel}
          </Text>
        </Pressable>
      </YStack>
      <YStack
        flex={1}
        backgroundColor="$muted"
        borderRadius="$4"
        borderWidth={2}
        borderColor="$border"
        paddingHorizontal="$4"
        paddingVertical="$2.5"
      >
        <Pressable onPress={() => onSortChange(sort === 'newest' ? 'oldest' : 'newest')}>
          <Text color="$foreground" fontSize={14}>
            {sortLabel}
          </Text>
        </Pressable>
      </YStack>
    </XStack>
  );
}
