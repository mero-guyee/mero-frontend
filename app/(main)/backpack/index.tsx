import BackpackHeader from '@/components/backpack/BackpackHeader';
import BackpackSkeleton from '@/components/backpack/BackpackSkeleton';
import TripCoverImage from '@/components/trips/TripCoverImage';
import { DocumentsTab } from '@/components/trips/documents/DocumentsTab';
import MemoTab from '@/components/trips/memos/MemoTab';
import FadeWrapper from '@/components/ui/FadeWrapper';
import { SubTabs } from '@/components/ui/tabbar/subTabs/SubTabs';
import { useTripQuery } from '@/hooks/queries/useTrips';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { Text, YStack } from 'tamagui';
import { useMemos, useTrips } from '../../../contexts';

const routes = [
  { key: 'memos', title: '메모' },
  { key: 'files', title: '서류' },
];

export default function TripHomeScreen() {
  const { activeTrip } = useTrips();
  const { data: trip, isLoading } = useTripQuery(activeTrip || '');
  const { memos } = useMemos();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);

  if (isLoading) {
    return <BackpackSkeleton />;
  }

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
      <FadeWrapper>
        <YStack flex={1}>
          <TripCoverImage uri={trip.imageUrl} trip={trip} />

          <TabView
            navigationState={{ index, routes }}
            renderScene={({ route }) => {
              switch (route.key) {
                case 'memos':
                  return <MemoTab memos={memos} tripId={activeTrip!} />;
                case 'files':
                  return <DocumentsTab tripId={trip.id} />;
                default:
                  return null;
              }
            }}
            renderTabBar={(props) => (
              <SubTabs
                tabs={props.navigationState.routes.map((r) => ({ value: r.key, label: r.title! }))}
                activeTab={props.navigationState.routes[props.navigationState.index].key}
                onTabChange={props.jumpTo}
                swipePosition={props.position}
              />
            )}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
          />
        </YStack>
      </FadeWrapper>
    </YStack>
  );
}
