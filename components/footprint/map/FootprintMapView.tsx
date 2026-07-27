import { useFootprintClusters } from '@/hooks/map/useFootprintClusters';
import { useFootprintMapData } from '@/hooks/map/useFootprintMapData';
import { useIsOffline } from '@/hooks/network/useIsOffline';
import { Footprint } from '@/types';
import { Plane } from '@tamagui/lucide-icons';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import Supercluster from 'supercluster';
import { Text } from 'tamagui';
import { useTheme as useAppTheme } from '../../../contexts';
import ClusterMarker from '../../map/ClusterMarker';
import { darkMapStyle } from '../../map/darkMapStyle';
import MapOfflineFallback from '../../map/MapOfflineFallback';
import PinMarker from '../../map/PinMarker';
import FadeWrapper from '../../ui/FadeWrapper';
import FootprintMapModal from './FootprintMapModal';

interface FootprintMapViewProps {
  isLoading: boolean;
  footprints: Footprint[];
}

export default function FootprintMapView({ isLoading, footprints }: FootprintMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const isSelectingRef = useRef(false);
  const [selectedFootprint, setSelectedFootprint] = useState<Footprint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const isOffline = useIsOffline();
  const { theme } = useAppTheme();

  const { validFootprints, footprintColors, allCoords } = useFootprintMapData(footprints);

  const { clusters, handleRegionChangeComplete, handleClusterPress } = useFootprintClusters(
    mapRef,
    validFootprints
  );

  useEffect(() => {
    if (allCoords.length === 0) return;
    setTimeout(() => {
      const target = allCoords[allCoords.length - 1];
      mapRef.current?.animateToRegion(
        {
          latitude: target.latitude,
          longitude: target.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300
      );
    }, 300);
  }, [allCoords]);

  const handleSelectFootprint = (footprint: Footprint, latitude: number, longitude: number) => {
    isSelectingRef.current = true;
    setSelectedFootprint(footprint);
    setSelectedPoint({ latitude, longitude });
    setShowModal(true);

    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300
    );
  };

  const handleDeselect = () => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }
    setSelectedFootprint(null);
    setSelectedPoint(null);
  };

  const handleCloseModal = () => {
    setSelectedFootprint(null);
    setSelectedPoint(null);
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Plane size={48} color="#C0B8B0" />
      </View>
    );
  }

  if (footprints.length === 0 || !footprints) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text>일지가 없습니다.</Text>
      </View>
    );
  }

  if (isOffline) {
    return <MapOfflineFallback />;
  }

  return (
    <FadeWrapper>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          showsPointsOfInterest={false}
          style={StyleSheet.absoluteFillObject}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={handleDeselect}
          userInterfaceStyle={theme}
          customMapStyle={theme === 'dark' ? darkMapStyle : []}
        >
          {clusters.map((point) => {
            const [longitude, latitude] = point.geometry.coordinates;

            if ('cluster' in point.properties && point.properties.cluster) {
              const clusterProps = point.properties as Supercluster.ClusterProperties;
              return (
                <ClusterMarker
                  key={`cluster-${clusterProps.cluster_id}`}
                  coordinate={{ latitude, longitude }}
                  count={clusterProps.point_count}
                  onPress={() => handleClusterPress(clusterProps.cluster_id, latitude, longitude)}
                />
              );
            }

            const { footprintId } = point.properties as { footprintId: string };
            const footprint = validFootprints.find((f) => f.id === footprintId);
            if (!footprint) return null;

            return (
              <PinMarker
                key={`marker-${footprintId}-${longitude}-${latitude}`}
                coordinate={{ latitude, longitude }}
                color={footprintColors[footprintId]}
                isSelected={
                  selectedPoint?.latitude === latitude && selectedPoint?.longitude === longitude
                }
                onPress={() => handleSelectFootprint(footprint, latitude, longitude)}
              />
            );
          })}
        </MapView>

        <FootprintMapModal
          visible={showModal}
          onClose={handleCloseModal}
          footprint={selectedFootprint}
        />
      </View>
    </FadeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
