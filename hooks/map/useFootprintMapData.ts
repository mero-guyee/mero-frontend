import { Footprint } from '@/types';
import { useMemo } from 'react';

const JITTER_RADIUS_DEG = 0.00008;

export interface FootprintMapPoint {
  footprint: Footprint;
  latitude: number;
  longitude: number;
}

export function useFootprintMapData(footprints: Footprint[]) {
  const validFootprints = useMemo(
    () =>
      footprints
        .filter((f) => f.locations.length > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [footprints]
  );

  const points = useMemo<FootprintMapPoint[]>(() => {
    const raw = validFootprints.flatMap((f) =>
      f.locations.map((loc) => ({
        footprint: f,
        latitude: loc.latitude!,
        longitude: loc.longitude!,
      }))
    );

    const groups = new Map<string, typeof raw>();
    raw.forEach((p) => {
      const key = `${p.latitude},${p.longitude}`;
      const group = groups.get(key);
      if (group) group.push(p);
      else groups.set(key, [p]);
    });

    const result: FootprintMapPoint[] = [];
    groups.forEach((group) => {
      group.forEach((p, i) => {
        let { latitude, longitude } = p;
        if (group.length > 1) {
          const angle = (2 * Math.PI * i) / group.length;
          latitude += JITTER_RADIUS_DEG * Math.sin(angle);
          longitude += (JITTER_RADIUS_DEG * Math.cos(angle)) / Math.cos((latitude * Math.PI) / 180);
        }
        result.push({ footprint: p.footprint, latitude, longitude });
      });
    });

    return result;
  }, [validFootprints]);

  const allCoords = useMemo(
    () => points.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
    [points]
  );

  return { validFootprints, points, allCoords };
}
