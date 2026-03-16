import { ApiError } from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../../api/trips';
import { useDb } from '../../providers/DatabaseProvider';
import { MemoRepository, TripRepository } from '../../repositories';
import { Trip } from '../../types';
import { tripKeys } from './queryKeys';

export { tripKeys } from './queryKeys';

export function useTripsQuery() {
  const db = useDb();
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: async () => {
      const repo = new TripRepository(db);
      try {
        const serverTrips = await tripsApi.getAll();
        await Promise.all(serverTrips.map((t) => repo.upsertFromServer(t)));
      } catch {
        // offline — use local cache
      }
      return repo.getAllTrips();
    },
  });
}

export function useTripQuery(id: string) {
  const db = useDb();
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => new TripRepository(db).getTripById(id),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Trip, 'id'>) => {
      const repo = new TripRepository(db);
      const localTrip = await repo.createTrip(data);
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
      } catch (e) {
        if (e instanceof ApiError) {
          console.error('Failed to create trip on server:', e.status, e.message);
        }
      }
      return localTrip;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useUpdateTrip() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (trip: Trip) => {
      const repo = new TripRepository(db);
      const updated = await repo.updateTrip(trip);
      try {
        if (trip.serverId) {
          await tripsApi.update(parseInt(trip.serverId), {
            title: trip.title,
            startDate: trip.startDate,
            endDate: trip.endDate,
            countries: trip.countries,
          });
          await repo.markSynced(trip.id);
        }
      } catch {
        // stays pending
      }
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
      try {
        if (trip?.serverId) {
          await tripsApi.delete(parseInt(trip.serverId));
        }
      } catch {
        // stays soft-deleted with pending status
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}
