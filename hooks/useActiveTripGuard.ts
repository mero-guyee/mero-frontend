import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth, useTrips } from '../contexts';

export function useActiveTripGuard() {
  const { activeTrip } = useTrips();
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;

    const isOnTrips = segments.some((s) => s === 'trips');
    const isOnSettings = segments.some((s) => s === 'settings');

    if (isOnSettings) return;

    if (!activeTrip && !isOnTrips) {
      router.replace('/(main)/trips');
    }
  }, [activeTrip, segments, isAuthenticated, router]);
}
