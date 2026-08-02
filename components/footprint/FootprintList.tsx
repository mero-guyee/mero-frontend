import { EmptyState, Input } from '@/components/ui';
import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import { NotebookPen, Plus } from '@tamagui/lucide-icons';
import { SectionList } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Footprint } from '../../types';
import FootprintItem from './FootprintItem';

interface FootprintSection {
  title: string;
  dayLabel?: string;
  data: Footprint[];
}

interface Props {
  sections: FootprintSection[];
  showSearch: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateFootprint: () => void;
  onSelectFootprint: (id: string) => void;
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

function DateHeaderContent({ section }: { section: FootprintSection }) {
  return (
    <YStack backgroundColor="$background" paddingBottom="$2">
      <XStack alignItems="center" gap="$1.5">
        <Text fontSize={16} fontWeight="600" color="$foreground">
          {section.title}
        </Text>
        {section.dayLabel && (
          <Text fontSize={13} fontWeight="500" color="$mutedForeground">
            · {section.dayLabel}
          </Text>
        )}
      </XStack>
    </YStack>
  );
}

export default function FootprintList({
  sections,
  showSearch,
  searchQuery,
  onSearchChange,
  onCreateFootprint,
  onSelectFootprint,
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
            placeholderTextColor="$placeholderForeground"
            value={searchQuery}
            onChangeText={onSearchChange}
            color="$foreground"
          />
        </XStack>
      )}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => <DateHeaderContent section={section} />}
        renderItem={({ item }) => (
          <FootprintItem
            footprint={item}
            onPress={() => onSelectFootprint(item.id)}
            showSyncBadge={
              item.id === createdId &&
              (item.syncStatus === 'pending' || item.syncStatus === 'synced')
            }
          />
        )}
        renderSectionFooter={() => <YStack height="$6" />}
        ListEmptyComponent={EmptyList}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          flexGrow: isEmpty ? 1 : undefined,
        }}
        stickySectionHeadersEnabled={false}
      />
      <FloatingActionButton onPress={onCreateFootprint}>
        <XStack alignItems="center" gap="$2">
          <Plus color="$foreground" />
          <Text color="$foreground">새 일지</Text>
        </XStack>
      </FloatingActionButton>
    </>
  );
}
