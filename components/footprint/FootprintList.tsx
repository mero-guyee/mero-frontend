import { EmptyState, Input } from '@/components/ui';
import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import { NotebookPen, Plus } from '@tamagui/lucide-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { SectionList, ViewToken } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text, useTheme, XStack, YStack } from 'tamagui';
import { Footprint, FootprintDraft } from '../../types';
import FootprintDraftItem from './FootprintDraftItem';
import FootprintItem from './FootprintItem';

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface FootprintSection {
  title: string;
  dayLabel?: string;
  data: Footprint[];
}

interface Props {
  sections: FootprintSection[];
  drafts: FootprintDraft[];
  showSearch: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateFootprint: () => void;
  onSelectFootprint: (id: string) => void;
  onSelectDraft: (id: string) => void;
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
        <Text fontSize={15} fontWeight="600" color="$foreground">
          {section.title}
        </Text>
        {section.dayLabel && (
          <XStack
            backgroundColor="$muted"
            borderRadius={999}
            paddingHorizontal="$2"
            paddingVertical="$0.5"
          >
            <Text fontSize={12} fontWeight="600" color="$mutedForeground">
              {section.dayLabel}
            </Text>
          </XStack>
        )}
        {section.data.length > 1 && (
          <Text fontSize={12} fontWeight="500" color="$mutedForeground">
            · {section.data.length}개의 일지
          </Text>
        )}
      </XStack>
    </YStack>
  );
}

function FloatingDateHeader({ section }: { section: FootprintSection }) {
  const theme = useTheme();

  return (
    <YStack position="absolute" top={0} left={0} right={0} zIndex={1}>
      <YStack backgroundColor="$background" paddingHorizontal={16}>
        <Animated.View key={section.title} entering={FadeIn} exiting={FadeOut}>
          <DateHeaderContent section={section} />
        </Animated.View>
      </YStack>
      <LinearGradient
        colors={[theme.background.val, hexToRgba(theme.background.val, 0)]}
        style={{ height: 32 }}
        pointerEvents="none"
      />
    </YStack>
  );
}

export default function FootprintList({
  sections,
  drafts,
  showSearch,
  searchQuery,
  onSearchChange,
  onCreateFootprint,
  onSelectFootprint,
  onSelectDraft,
  isEmpty,
  createdId,
}: Props) {
  const [currentSection, setCurrentSection] = useState<FootprintSection | undefined>(sections[0]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentSection(viewableItems[0].section);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 0 }).current;

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
      <YStack>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => <DateHeaderContent section={section} />}
          ListHeaderComponent={
            drafts.length > 0 ? (
              <YStack marginBottom="$3">
                <Text fontSize={13} fontWeight="600" color="$mutedForeground" marginBottom="$2">
                  작성 중 ({drafts.length})
                </Text>
                {drafts.map((draft) => (
                  <FootprintDraftItem
                    key={draft.id}
                    draft={draft}
                    onPress={() => onSelectDraft(draft.id)}
                  />
                ))}
              </YStack>
            ) : null
          }
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
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        {!isEmpty && currentSection && <FloatingDateHeader section={currentSection} />}
      </YStack>
      <FloatingActionButton onPress={onCreateFootprint}>
        <XStack alignItems="center" gap="$2">
          <Plus color="$foreground" />
          <Text color="$foreground">새 일지</Text>
        </XStack>
      </FloatingActionButton>
    </>
  );
}
