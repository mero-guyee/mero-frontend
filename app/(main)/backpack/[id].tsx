import BackpackHeader from '@/components/backpack/BackpackHeader';
import TripDetailCoverImage from '@/components/trips/detail/TripDetailCoverImage';
import { TripDocumentsTab } from '@/components/trips/documents/TripDocumentsTab';
import MemoTab from '@/components/trips/memos/MemoTab';
import { useTripQuery } from '@/hooks/queries/useTrips';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Text, YStack } from 'tamagui';
import { SubTab, TripSubTabs } from '../../../components/trips/TripSubTabs';
import { useMemos } from '../../../contexts';

export default function TripHomeScreen() {
  const { id } = useLocalSearchParams<{ id: string; serverId?: string }>();
  const { data: trip } = useTripQuery(id || '');
  const { memos } = useMemos();

  const [showMenu, setShowMenu] = useState(false);
  const [subTab, setSubTab] = useState<SubTab>('memos');

  if (!trip) {
    return (
      <YStack flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <Text color="$foreground">여행을 찾을 수 없습니다</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackpackHeader trip={trip} />
      <ScrollView style={{ flex: 1 }}>
        <TripDetailCoverImage trip={trip} />

        <TripSubTabs activeTab={subTab} onTabChange={setSubTab} />

        <YStack padding="$5" paddingTop="$4">
          {subTab === 'memos' ? (
            <MemoTab memos={memos} tripId={id} />
          ) : (
            <TripDocumentsTab tripId={trip.serverId!} />
          )}
        </YStack>

        <YStack height={100} />
      </ScrollView>

      {showMenu && (
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
          }}
          onPress={() => setShowMenu(false)}
        />
      )}
    </YStack>
  );
}
