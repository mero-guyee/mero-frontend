import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LocationRepository, LocationRecord } from '../../repositories';
import { useDb } from '../../providers/DatabaseProvider';

export const locationKeys = {
  byTrip: (tripId: string) => ['locations', 'trip', tripId] as const,
};

export function useLocationsByTripQuery(tripId: string) {
  const db = useDb();
  return useQuery({
    queryKey: locationKeys.byTrip(tripId),
    queryFn: () => new LocationRepository(db).getLocationsByTripId(tripId),
    enabled: !!tripId,
  });
}

export function useCreateLocation() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<LocationRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>
    ) => new LocationRepository(db).createLocation(data),
    onSuccess: (location) =>
      qc.invalidateQueries({ queryKey: locationKeys.byTrip(location.tripId) }),
  });
}
