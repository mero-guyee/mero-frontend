import { ApiError } from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../../api/trips';
import { useSyncContext } from '../../contexts/SyncContext';
import { useDb } from '../../providers/DatabaseProvider';
import { MemoRepository, TripRepository } from '../../repositories';
import { Trip } from '../../types';
import { tripKeys } from './queryKeys';

export { tripKeys } from './queryKeys';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export function useTripsQuery() {
  const db = useDb();
  const qc = useQueryClient();
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: async () => {
      const repo = new TripRepository(db);

      (async () => {
        try {
          const serverTrips = await tripsApi.getAll();
          await Promise.all(serverTrips.map((t) => repo.upsertFromServer(t)));
          const fresh = await repo.getAllTrips();
          qc.setQueryData(tripKeys.all, fresh);
        } catch {}
      })();

      return repo.getAllTrips();
    },
  });
}

export function useTripQuery(id: string) {
  const db = useDb();
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: async () => {
      const repo = new TripRepository(db);
      const tripRow = await repo.getTripById(id);

      try {
        if (tripRow?.serverId) {
          const serverTrip = await tripsApi.getById(parseInt(tripRow.serverId));
          await repo.upsertFromServer(serverTrip);
        }
      } catch (e) {
        console.error('Failed to fetch trip from server:', e);
      }

      return repo.getTripById(id);
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const db = useDb();
  const qc = useQueryClient();
  const { markSyncing, unmarkSyncing, markJustSynced } = useSyncContext();
  return useMutation({
    mutationFn: async (data: Omit<Trip, 'id'>) => {
      const repo = new TripRepository(db);
      const localTrip = await repo.createTrip(data);

      (async () => {
        markSyncing(localTrip.id);
        try {
          const serverTrip = await tripsApi.create({
            clientId: localTrip.id,
            title: data.title,
            startDate: data.startDate,
            endDate: data.endDate,
            countries: data.countries,
            imageUrl: data.imageUrl,
          });
          await repo.setServerId(localTrip.id, String(serverTrip.id));
          markJustSynced(localTrip.id);
          qc.invalidateQueries({ queryKey: tripKeys.all });
        } catch (e) {
          if (e instanceof ApiError) {
            console.error('Failed to create trip on server:', e.status, e.message);
          }
        } finally {
          unmarkSyncing(localTrip.id);
        }
      })();

      return localTrip;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

export function useUpdateTrip() {
  const db = useDb();
  const qc = useQueryClient();
  const { markSyncing, unmarkSyncing, markJustSynced } = useSyncContext();
  return useMutation({
    mutationFn: async (trip: Trip) => {
      const repo = new TripRepository(db);
      const updated = await repo.updateTrip(trip);

      (async () => {
        markSyncing(trip.id);
        try {
          if (trip.serverId) {
            await tripsApi.update(parseInt(trip.serverId), {
              title: trip.title,
              startDate: trip.startDate,
              endDate: trip.endDate,
              countries: trip.countries,
            });

            if (trip.imageUrl) {
              await tripsApi.uploadImage(parseInt(trip.serverId), trip.imageUrl);
            }

            await repo.markSynced(trip.id);
            markJustSynced(trip.id);
            qc.invalidateQueries({ queryKey: tripKeys.all });
            qc.invalidateQueries({ queryKey: tripKeys.detail(trip.id) });
          }
        } catch {
          // stays pending
        } finally {
          unmarkSyncing(trip.id);
        }
      })();

      return updated;
    },
    onSuccess: (_, trip) => {
      qc.invalidateQueries({ queryKey: tripKeys.all });
      qc.invalidateQueries({ queryKey: tripKeys.detail(trip.id) });
    },
  });
}

export function useDeleteTrip() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tripId: string) => {
      const repo = new TripRepository(db);
      const memoRepo = new MemoRepository(db);
      const trip = await repo.getTripById(tripId);
      await repo.deleteTrip(tripId);
      await memoRepo.deleteByTripId(tripId);

      (async () => {
        try {
          if (trip?.serverId) {
            await tripsApi.delete(parseInt(trip.serverId));
            await repo.removeFromOutbox(tripId);
          }
        } catch (e) {
          console.error('Failed to delete trip on server:', e);
        }
      })();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}
