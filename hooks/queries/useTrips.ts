import { ApiError } from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../../api/trips';
import { useSyncContext } from '../../contexts/SyncContext';
import { useDb } from '../../providers/DatabaseProvider';
import {
  BudgetRepository,
  DocumentRepository,
  FootprintRepository,
  MemoRepository,
  TripRepository,
} from '../../repositories';
import { Trip } from '../../types';
import { resolveThumbhash } from '../../utils/thumbhash';
import { enqueueMutation } from './mutationQueue';
import { tripKeys, unrecordedTripsKeys } from './queryKeys';

export { tripKeys } from './queryKeys';

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
  const qc = useQueryClient();
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: async () => {
      const repo = new TripRepository(db);
      const tripRow = await repo.getTripById(id);

      if (tripRow?.serverId) {
        (async () => {
          try {
            const serverTrip = await tripsApi.getById(parseInt(tripRow.serverId!));
            await repo.upsertFromServer(serverTrip);
            const fresh = await repo.getTripById(id);
            qc.setQueryData(tripKeys.detail(id), fresh);
          } catch (e) {
            console.error('Failed to fetch trip from server:', e);
          }
        })();
      }

      return tripRow;
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const db = useDb();
  const qc = useQueryClient();
  const { markSyncing, unmarkSyncing, markSyncSucceeded, markSyncFailed } = useSyncContext();
  return useMutation({
    mutationFn: async (data: Omit<Trip, 'id'>) => {
      const repo = new TripRepository(db);
      const thumbhash = await resolveThumbhash(data.imageUrl);
      const localTrip = await repo.createTrip({ ...data, thumbhash });

      enqueueMutation(localTrip.id, async () => {
        markSyncing(localTrip.id);
        try {
          const fresh = await repo.getTripById(localTrip.id);
          if (!fresh || fresh.serverId) return;
          const serverTrip = await tripsApi.create({
            clientId: fresh.id,
            title: fresh.title,
            startDate: fresh.startDate,
            endDate: fresh.endDate,
            countries: fresh.countries,
            imageUrl: fresh.imageUrl,
          });
          await repo.setServerId(fresh.id, String(serverTrip.id));
          markSyncSucceeded(localTrip.id);
          qc.invalidateQueries({ queryKey: tripKeys.all });
        } catch (e) {
          if (e instanceof ApiError) {
            console.error('Failed to create trip on server:', e.status, e.message);
          }
          markSyncFailed(localTrip.id);
        } finally {
          unmarkSyncing(localTrip.id);
        }
      });

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
  const { markSyncing, unmarkSyncing, markSyncSucceeded, markSyncFailed } = useSyncContext();
  return useMutation({
    mutationFn: async (trip: Trip) => {
      const repo = new TripRepository(db);
      const thumbhash = await resolveThumbhash(trip.imageUrl, trip.thumbhash);
      const updated = await repo.updateTrip({ ...trip, thumbhash });

      enqueueMutation(trip.id, async () => {
        markSyncing(trip.id);
        try {
          const fresh = await repo.getTripById(trip.id);
          if (fresh?.serverId) {
            await tripsApi.update(parseInt(fresh.serverId), {
              title: fresh.title,
              startDate: fresh.startDate,
              endDate: fresh.endDate,
              countries: fresh.countries,
            });

            if (fresh.imageUrl) {
              await tripsApi.uploadImage(parseInt(fresh.serverId), fresh.imageUrl);
            }

            await repo.markSynced(trip.id);
            markSyncSucceeded(trip.id);
            qc.invalidateQueries({ queryKey: tripKeys.all });
            qc.invalidateQueries({ queryKey: tripKeys.detail(trip.id) });
          }
        } catch {
          markSyncFailed(trip.id);
        } finally {
          unmarkSyncing(trip.id);
        }
      });

      return updated;
    },
    onSuccess: (_, trip) => {
      qc.invalidateQueries({ queryKey: tripKeys.all });
      qc.invalidateQueries({ queryKey: tripKeys.detail(trip.id) });
    },
  });
}

export interface TripsByStatus {
  ongoing: Trip[];
  planned: Trip[];
  completed: Trip[];
}

export type UnrecordedTarget = 'footprint' | 'memo' | 'document' | 'budget';

export interface UnrecordedTrip {
  trip: Trip;
  status: 'ongoing' | 'planned';
  target: UnrecordedTarget;
}

export function useTripsWithoutRecordsQuery(tripsByStatus: TripsByStatus) {
  const db = useDb();
  const allTripIds = [...tripsByStatus.ongoing, ...tripsByStatus.planned].map((t) => t.id);

  return useQuery({
    queryKey: [...unrecordedTripsKeys.all, allTripIds],
    queryFn: async (): Promise<UnrecordedTrip[]> => {
      const memoRepo = new MemoRepository(db);
      const footprintRepo = new FootprintRepository(db);
      const documentRepo = new DocumentRepository(db);
      const budgetRepo = new BudgetRepository(db);

      const [memoTripIds, footprintTripIds, documentTripIds, budgetTripIds] = await Promise.all([
        memoRepo.getTripIdsWithMemos(),
        footprintRepo.getTripIdsWithFootprints(),
        documentRepo.getTripIdsWithDocuments(),
        budgetRepo.getTripIdsWithBudgets(),
      ]);

      const isFullyRecorded = (id: string) => memoTripIds.has(id) && footprintTripIds.has(id);
      const hasAnyPrep = (id: string) => documentTripIds.has(id) || budgetTripIds.has(id);

      const plannedByStartDateAsc = [...tripsByStatus.planned].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      return [
        ...tripsByStatus.ongoing
          .filter((trip) => !isFullyRecorded(trip.id))
          .map(
            (trip): UnrecordedTrip => ({
              trip,
              status: 'ongoing',
              target: footprintTripIds.has(trip.id) ? 'memo' : 'footprint',
            })
          ),
        ...plannedByStartDateAsc
          .filter((trip) => !hasAnyPrep(trip.id))
          .map((trip): UnrecordedTrip => ({ trip, status: 'planned', target: 'document' })),
      ];
    },
    enabled: allTripIds.length > 0,
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
