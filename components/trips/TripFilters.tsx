import { ArrowDownUp } from '@tamagui/lucide-icons';
import { Text, XStack } from 'tamagui';

type FilterType = 'all' | 'ongoing' | 'completed';
type SortType = 'newest' | 'oldest';

interface TripFiltersProps {
  filter: FilterType;
  sort: SortType;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
}

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'ongoing', label: '진행 중' },
  { value: 'completed', label: '완료됨' },
];

export function TripFilters({ filter, sort, onFilterChange, onSortChange }: TripFiltersProps) {
  const toggleSort = () => onSortChange(sort === 'newest' ? 'oldest' : 'newest');

  return (
    <XStack gap="$2" ai="center" jc="space-between">
      {/* 세그먼트 컨트롤 */}
      <XStack br="$4" bg="$muted" p="$1" gap="$0">
        {filterOptions.map((opt) => {
          const isActive = filter === opt.value;
          return (
            <XStack
              key={opt.value}
              px="$3"
              py="$1.5"
              br="$3"
              bg={isActive ? '$background' : 'transparent'}
              onPress={() => onFilterChange(opt.value)}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text
                fontSize={13}
                fontWeight={isActive ? '600' : '400'}
                color={isActive ? '$color' : '$mutedForeground'}
              >
                {opt.label}
              </Text>
            </XStack>
          );
        })}
      </XStack>

      {/* 정렬 토글 */}
      <XStack
        ai="center"
        gap="$1.5"
        px="$3"
        py="$1.5"
        br="$4"
        bg="$muted"
        onPress={toggleSort}
        pressStyle={{ opacity: 0.7 }}
      >
        <ArrowDownUp size={13} color="$mutedForeground" />
        <Text fontSize={13} color="$mutedForeground">
          {sort === 'newest' ? '최신순' : '오래된 순'}
        </Text>
      </XStack>
    </XStack>
  );
}
