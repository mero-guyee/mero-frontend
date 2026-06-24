import { EmptyState, Input } from '@/components/ui';
import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import { NotebookPen, Plus } from '@tamagui/lucide-icons';
import { SectionList } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Footprint } from '../../types';
import FootprintItem from './FootprintItem';

interface FootprintSection {
  title: string;
  data: Footprint[];
}

interface Props {
  sections: FootprintSection[];
  showSearch: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateFootprint: () => void;
  onSelectFootprint: (id: string) => void;
  getFootprintExpense: (footprintId: string) => { total: number; currency: string };
  isEmpty: boolean;
  createdId?: string;
}

function EmptyList() {
  return (
    <EmptyState
      icon={<NotebookPen size={32} color="$mutedForeground" />}
      title="아직 일지가 없어요"
      description="여행의 순간순간을 기록해보세요"
    />
  );
}

export default function FootprintList({
  sections,
  showSearch,
  searchQuery,
  onSearchChange,
  onCreateFootprint,
  onSelectFootprint,
  getFootprintExpense,
  isEmpty,
  createdId,
}: Props) {
  return (
    <>
      {showSearch && (
        <XStack marginTop="$3">
          <Input
            flex={1}
            backgroundColor="$muted"
            borderWidth={1}
            borderColor="$border"
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$2"
            placeholder="일지 검색..."
            placeholderTextColor="$mutedForeground"
            value={searchQuery}
            onChangeText={onSearchChange}
            color="$foreground"
          />
        </XStack>
      )}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => (
          <FootprintItem
            footprint={item}
            isLast={index === section.data.length - 1}
            expense={getFootprintExpense(item.id)}
            onPress={() => onSelectFootprint(item.id)}
            showSyncBadge={
              item.id === createdId &&
              (item.syncStatus === 'pending' || item.syncStatus === 'synced')
            }
          />
        )}
        ListEmptyComponent={EmptyList}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 100,
          flexGrow: isEmpty ? 1 : undefined,
        }}
        stickySectionHeadersEnabled={true}
      />
      <FloatingActionButton onPress={onCreateFootprint}>
        <XStack alignItems="center" gap="$2">
          <Plus />
          <Text>새 일지</Text>
        </XStack>
      </FloatingActionButton>
    </>
  );
}
