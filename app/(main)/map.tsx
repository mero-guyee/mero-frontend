import PathMapView from '@/components/map/PathMapView';
import FadeWrapper from '@/components/ui/FadeWrapper';
import TabScreenHeader from '@/components/ui/header/TabScreenHeader';
import { YStack } from 'tamagui';
import { useFootprints } from '../../contexts';

export default function MapViewScreen() {
  const { footprints } = useFootprints();

  return (
    <YStack flex={1} backgroundColor="$background">
      <TabScreenHeader label="지도" />
      <FadeWrapper>
        <PathMapView footprints={footprints} />
      </FadeWrapper>
    </YStack>
  );
}
