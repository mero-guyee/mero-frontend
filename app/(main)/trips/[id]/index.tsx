import TripDetailCoverImage from '@/components/trips/detail/TripDetailCoverImage';
import TripDetailHeader from '@/components/trips/detail/TripDetailHeader';
import MemoTab from '@/components/trips/memos/MemoTab';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Text, YStack } from 'tamagui';
import { TripDocumentsTab } from '../../../../components/trips/documents/TripDocumentsTab';
import { SubTab, TripSubTabs } from '../../../../components/trips/TripSubTabs';
import { useTrips } from '../../../../contexts';

export default function TripHomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTripById, memos } = useTrips();

  const trip = getTripById(id || '');

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
      {/* App Bar */}
      <TripDetailHeader trip={trip} />
      <ScrollView style={{ flex: 1 }}>
        {/* Cover Image */}
        <TripDetailCoverImage trip={trip} />

        <TripSubTabs activeTab={subTab} onTabChange={setSubTab} />

        {/* Content Area */}
        <YStack padding="$5" paddingTop="$4">
          {subTab === 'memos' ? (
            // Memos Section
            <MemoTab memos={memos} tripId={id} />
          ) : (
            <TripDocumentsTab />
          )}
        </YStack>

        {/* Bottom padding for tab bar */}
        <YStack height={100} />
      </ScrollView>

      {/* Close menu when clicking outside */}
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
