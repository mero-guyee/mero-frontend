import { Footprint } from '@/types';
import { useEffect, useRef, useState } from 'react';
import MapView, { Region } from 'react-native-maps';
import Supercluster from 'supercluster';

type FootprintPoint = Supercluster.PointFeature<{ footprintId: string }>;

export function useFootprintClusters(
  mapRef: React.RefObject<MapView | null>,
  validFootprints: Footprint[],
  footprintCentroids: Record<string, { latitude: number; longitude: number }>
) {
  const scRef = useRef(new Supercluster<{ footprintId: string }>({ radius: 60, maxZoom: 16 }));
  const currentRegionRef = useRef<Region | null>(null);
  const [clusters, setClusters] = useState<ReturnType<typeof scRef.current.getClusters>>([]);

  const updateClusters = (region: Region) => {
    const zoom = Math.min(20, Math.round(Math.log(360 / region.latitudeDelta) / Math.LN2));
    const bbox: [number, number, number, number] = [
      region.longitude - region.longitudeDelta / 2,
      region.latitude - region.latitudeDelta / 2,
      region.longitude + region.longitudeDelta / 2,
      region.latitude + region.latitudeDelta / 2,
    ];
    setClusters(scRef.current.getClusters(bbox, zoom));
  };

  useEffect(() => {
    const points: FootprintPoint[] = validFootprints.map((f) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [footprintCentroids[f.id].longitude, footprintCentroids[f.id].latitude],
      },
      properties: { footprintId: f.id },
    }));
    scRef.current.load(points);
    if (currentRegionRef.current) updateClusters(currentRegionRef.current);
  }, [validFootprints, footprintCentroids]);

  const handleRegionChangeComplete = (region: Region) => {
    currentRegionRef.current = region;
    updateClusters(region);
  };

  const handleClusterPress = (clusterId: number, latitude: number, longitude: number) => {
    const expansionZoom = scRef.current.getClusterExpansionZoom(clusterId);
    const delta = 360 / Math.pow(2, expansionZoom);
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta },
      300
    );
  };

  return { clusters, handleRegionChangeComplete, handleClusterPress };
}
