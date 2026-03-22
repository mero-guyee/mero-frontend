import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { footprintsApi } from '../../api/footprints';
import { useDb } from '../../providers/DatabaseProvider';
import { FootprintRepository, TripRepository } from '../../repositories';
import { Footprint } from '../../types';

export const footprintKeys = {
  all: ['footprints'] as const,
  byTrip: (tripId: string) => ['footprints', 'trip', tripId] as const,
  detail: (id: string) => ['footprints', id] as const,
};


export function useFootprintsByTripQuery(tripId: string) {
  const db = useDb();
  return useQuery({
    queryKey: footprintKeys.byTrip(tripId),
    queryFn: async () => {
      const tripRepo = new TripRepository(db);
      const repo = new FootprintRepository(db);
      try {
        const trip = await tripRepo.getTripById(tripId);
        if (trip?.serverId) {
          const serverFootprints = await footprintsApi.getAll(parseInt(trip.serverId));
          await Promise.all(serverFootprints.map((f) => repo.upsertFromServer(f, tripId)));
        }
      } catch {
        // offline — use local cache
      }
      return repo.getFootprintsByTripId(tripId);
    },
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
    mutationFn: async (data: Omit<Footprint, 'id' | 'serverId'>) => {
      const tripRepo = new TripRepository(db);
      const repo = new FootprintRepository(db);
      const localFootprint = await repo.createFootprint(data);
      try {
        const trip = await tripRepo.getTripById(data.tripId);
        if (trip?.serverId) {
          const serverFootprint = await footprintsApi.create(parseInt(trip.serverId), {
            clientId: localFootprint.id,
            title: data.title,
            content: data.content,
            date: data.date,
            locations: data.locations,
            photoUrls: data.photoUrls,
          });
          await repo.setServerId(localFootprint.id, String(serverFootprint.id));
        }
      } catch {
        // stays pending
      }
      return localFootprint;
    },
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
    mutationFn: async (footprint: Footprint) => {
      const tripRepo = new TripRepository(db);
      const repo = new FootprintRepository(db);
      const updated = await repo.updateFootprint(footprint);
      try {
        if (footprint.serverId) {
          const trip = await tripRepo.getTripById(footprint.tripId);
          if (trip?.serverId) {
            await footprintsApi.update(parseInt(trip.serverId), parseInt(footprint.serverId), {
              title: footprint.title,
              content: footprint.content,
              date: footprint.date,
              locations: footprint.locations,
              photoUrls: footprint.photoUrls,
            });
            await repo.markSynced(footprint.id);
          }
        }
      } catch {
        // stays pending
      }
      return updated;
    },
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
      const tripRepo = new TripRepository(db);
      const repo = new FootprintRepository(db);
      const footprintRow = await repo.findById(id);
      await repo.deleteFootprint(id);
      try {
        if (footprintRow?.serverId) {
          const trip = await tripRepo.getTripById(tripId);
          if (trip?.serverId) {
            await footprintsApi.delete(parseInt(trip.serverId), parseInt(footprintRow.serverId));
          }
        }
      } catch {
        // stays soft-deleted with pending status
      }
      return tripId;
    },
    onSuccess: (tripId) => {
      qc.invalidateQueries({ queryKey: footprintKeys.all });
      qc.invalidateQueries({ queryKey: footprintKeys.byTrip(tripId) });
    },
  });
}
