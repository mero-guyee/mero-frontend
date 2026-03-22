import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useTrips } from '../contexts';

export function useActiveTripGuard() {
  const { activeTrip } = useTrips();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const isOnTrips = segments.some((s) => s === 'trips');
    if (!activeTrip && !isOnTrips) {
      router.replace('/(main)/trips');
    }
  }, [activeTrip, segments]);
}
