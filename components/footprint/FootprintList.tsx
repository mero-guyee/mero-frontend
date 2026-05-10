import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import { Input } from '@/components/ui';
import { Plus } from '@tamagui/lucide-icons';
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
}

function EmptyList() {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingVertical={80}
      paddingHorizontal="$4"
    >
      <Text fontSize={48} marginBottom="$4">
        📔
      </Text>
      <Text color="$foreground" marginBottom="$1">
        아직 일지가 없습니다
      </Text>
      <Text color="$mutedForeground">새 일지를 작성해보세요</Text>
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
  getFootprintExpense,
  isEmpty,
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
