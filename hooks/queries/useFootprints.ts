import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Footprint } from '../../types';
import { FootprintRepository } from '../../repositories';
import { useDb } from '../../providers/DatabaseProvider';

export const footprintKeys = {
  all: ['footprints'] as const,
  byTrip: (tripId: string) => ['footprints', 'trip', tripId] as const,
  detail: (id: string) => ['footprints', id] as const,
};

export function useFootprintsQuery() {
  const db = useDb();
  return useQuery({
    queryKey: footprintKeys.all,
    queryFn: () => new FootprintRepository(db).getAllFootprints(),
  });
}

export function useFootprintsByTripQuery(tripId: string) {
  const db = useDb();
  return useQuery({
    queryKey: footprintKeys.byTrip(tripId),
    queryFn: () => new FootprintRepository(db).getFootprintsByTripId(tripId),
    enabled: !!tripId,
  });
}

export function useFootprintQuery(id: string) {
  const db = useDb();
  return useQuery({
    queryKey: footprintKeys.detail(id),
    queryFn: () => new FootprintRepository(db).getFootprintById(id),
    enabled: !!id,
  });
}

export function useCreateFootprint() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Footprint, 'id' | 'serverId'>) => new FootprintRepository(db).createFootprint(data),
    onSuccess: (footprint) => {
      qc.invalidateQueries({ queryKey: footprintKeys.all });
      qc.invalidateQueries({ queryKey: footprintKeys.byTrip(footprint.tripId) });
    },
  });
}

export function useUpdateFootprint() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (footprint: Footprint) => new FootprintRepository(db).updateFootprint(footprint),
    onSuccess: (_, footprint) => {
      qc.invalidateQueries({ queryKey: footprintKeys.all });
      qc.invalidateQueries({ queryKey: footprintKeys.byTrip(footprint.tripId) });
      qc.invalidateQueries({ queryKey: footprintKeys.detail(footprint.id) });
    },
  });
}

export function useDeleteFootprint() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      await new FootprintRepository(db).deleteFootprint(id);
      return tripId;
    },
    onSuccess: (tripId) => {
      qc.invalidateQueries({ queryKey: footprintKeys.all });
      qc.invalidateQueries({ queryKey: footprintKeys.byTrip(tripId) });
    },
  });
}
