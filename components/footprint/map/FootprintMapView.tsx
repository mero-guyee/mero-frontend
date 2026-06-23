import { useFootprintClusters } from '@/hooks/map/useFootprintClusters';
import { useFootprintMapData } from '@/hooks/map/useFootprintMapData';
import { Footprint } from '@/types';
import { Plane } from '@tamagui/lucide-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import Supercluster from 'supercluster';
import { Text } from 'tamagui';
import FadeWrapper from '../../ui/FadeWrapper';
import ClusterMarker from '../../map/ClusterMarker';
import FootprintMapModal from './FootprintMapModal';
import PinMarker from '../../map/PinMarker';

const { width, height } = Dimensions.get('window');
const MAP_PADDING = Math.min(width, height) * 0.1;

interface FootprintMapViewProps {
  isLoading: boolean;
  footprints: Footprint[];
}

export default function FootprintMapView({ isLoading, footprints }: FootprintMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const isSelectingRef = useRef(false);
  const [selectedFootprint, setSelectedFootprint] = useState<Footprint | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { validFootprints, footprintColors, footprintCentroids, allCoords } =
    useFootprintMapData(footprints);

  const { clusters, handleRegionChangeComplete, handleClusterPress } = useFootprintClusters(
    mapRef,
    validFootprints,
    footprintCentroids
  );

  useEffect(() => {
    if (allCoords.length === 0) return;
    setTimeout(() => {
      if (allCoords.length === 1) {
        mapRef.current?.animateToRegion(
          {
            latitude: allCoords[0].latitude,
            longitude: allCoords[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          300
        );
      } else {
        mapRef.current?.fitToCoordinates(allCoords, {
          edgePadding: {
            top: MAP_PADDING,
            right: MAP_PADDING,
            bottom: MAP_PADDING,
            left: MAP_PADDING,
          },
          animated: false,
        });
      }
    }, 300);
  }, [allCoords]);

  const handleSelectFootprint = (footprint: Footprint) => {
    isSelectingRef.current = true;
    setSelectedFootprint(footprint);
    setShowModal(true);

    const coords = footprint.locations.map((loc) => ({
      latitude: loc.latitude!,
      longitude: loc.longitude!,
    }));
    if (coords.length === 1) {
      mapRef.current?.animateToRegion(
        {
          latitude: coords[0].latitude,
          longitude: coords[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300
      );
    } else {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
        animated: true,
      });
    }
  };

  const handleDeselect = () => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }
    setSelectedFootprint(null);
  };

  const handleCloseModal = () => {
    setSelectedFootprint(null);
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

  return (
    <FadeWrapper>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          showsPointsOfInterest={false}
          style={StyleSheet.absoluteFillObject}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={handleDeselect}
        >
          {clusters.map((point, index) => {
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
                key={`marker-${footprintId}-${index}`}
                coordinate={{ latitude, longitude }}
                color={footprintColors[footprintId]}
                isSelected={selectedFootprint?.id === footprintId}
                onPress={() => handleSelectFootprint(footprint)}
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
