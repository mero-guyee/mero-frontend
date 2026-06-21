import { ApiError } from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../../api/documents';
import { tripsApi } from '../../api/trips';
import { useDb } from '../../providers/DatabaseProvider';
import { DocumentRepository, TripRepository } from '../../repositories';
import { TripDocumentFile } from '../../types';
import { documentKeys } from './queryKeys';

export function useDocumentsQuery(tripId: string) {
  const db = useDb();
  const qc = useQueryClient();
  return useQuery({
    queryKey: documentKeys.byTrip(tripId),
    queryFn: async () => {
      const docRepo = new DocumentRepository(db);
      const tripRepo = new TripRepository(db);

      (async () => {
        try {
          const trip = await tripRepo.getTripById(tripId);
          if (trip?.serverId) {
            const serverTrip = await tripsApi.getById(parseInt(trip.serverId));
            await Promise.all(serverTrip.documents.map((doc) => docRepo.upsertFromServer(tripId, doc)));
            const fresh = await docRepo.findByTripId(tripId);
            qc.setQueryData(documentKeys.byTrip(tripId), fresh);
          }
        } catch {
          // offline — use local cache
        }
      })();

      return docRepo.findByTripId(tripId);
    },
    enabled: !!tripId,
  });
}

export function useCreateDocument() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, data }: { tripId: string; data: TripDocumentFile }) => {
      const docRepo = new DocumentRepository(db);
      const tripRepo = new TripRepository(db);
      const doc = await docRepo.createDocument(tripId, data);

      (async () => {
        try {
          const trip = await tripRepo.getTripById(tripId);
          if (trip?.serverId) {
            const serverDoc = await documentsApi.upload({
              tripId: parseInt(trip.serverId),
              clientId: doc.id,
              file: data,
            });
            await docRepo.setServerId(doc.id, String(serverDoc.id));
            qc.invalidateQueries({ queryKey: documentKeys.byTrip(tripId) });
          }
        } catch (e) {
          if (e instanceof ApiError) {
            console.error('Failed to upload document to server:', e);
          }
        }
      })();

      return doc;
    },
    onSuccess: (_, { tripId }) => {
      qc.invalidateQueries({ queryKey: documentKeys.byTrip(tripId) });
    },
  });
}

export function useDeleteDocument() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      const docRepo = new DocumentRepository(db);
      const tripRepo = new TripRepository(db);
      const doc = await docRepo.findById(id);
      await docRepo.delete(id);

      (async () => {
        try {
          if (doc?.serverId) {
            const trip = await tripRepo.getTripById(tripId);
            if (trip?.serverId) {
              await documentsApi.delete(parseInt(trip.serverId), parseInt(doc.serverId));
            }
          }
        } catch (e) {
          console.error('Failed to delete document from server:', e);
        }
      })();

      return tripId;
    },
    onSuccess: (_, { tripId }) => {
      qc.invalidateQueries({ queryKey: documentKeys.byTrip(tripId) });
    },
  });
}
