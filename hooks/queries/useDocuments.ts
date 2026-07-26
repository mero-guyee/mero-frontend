import { ApiError } from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import { documentsApi } from '../../api/documents';
import { tripsApi } from '../../api/trips';
import { useSyncContext } from '../../contexts/SyncContext';
import { useDb } from '../../providers/DatabaseProvider';
import { DocumentRepository, TripRepository } from '../../repositories';
import { TripDocumentFile } from '../../types';
import { documentKeys } from './queryKeys';

function persistToDocumentDirectory(ogFile: TripDocumentFile): TripDocumentFile {
  const documentsDir = new Directory(Paths.document, 'documents');
  if (!documentsDir.exists) {
    documentsDir.create({ intermediates: true });
  }
  const ext = ogFile.fileName.split('.').pop();
  const newFile = new File(documentsDir, `${Crypto.randomUUID()}.${ext}`);
  new File(ogFile.fileUri).copy(newFile);
  return { fileName: ogFile.fileName, fileUri: newFile.name };
}

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
            await Promise.all(
              serverTrip.documents.map((doc) => docRepo.upsertFromServer(tripId, doc))
            );
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
  const { markSyncing, unmarkSyncing, markSyncSucceeded, markSyncFailed } = useSyncContext();
  return useMutation({
    mutationFn: async ({ tripId, data }: { tripId: string; data: TripDocumentFile }) => {
      const docRepo = new DocumentRepository(db);
      const tripRepo = new TripRepository(db);
      const persisted = persistToDocumentDirectory(data);
      const doc = await docRepo.createDocument(tripId, persisted);

      (async () => {
        markSyncing(doc.id);
        try {
          const trip = await tripRepo.getTripById(tripId);
          if (trip?.serverId) {
            const serverDoc = await documentsApi.upload({
              tripId: parseInt(trip.serverId),
              clientId: doc.id,
              file: data,
            });
            await docRepo.setServerId(doc.id, String(serverDoc.id));
            markSyncSucceeded(doc.id);
            qc.invalidateQueries({ queryKey: documentKeys.byTrip(tripId) });
          }
        } catch (e) {
          if (e instanceof ApiError) {
            console.error('Failed to upload document to server:', e);
          }
          markSyncFailed(doc.id);
        } finally {
          unmarkSyncing(doc.id);
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
      const isLocalOnlyFile = doc?.fileUri && !/^https?:\/\//.test(doc.fileUri);
      if (isLocalOnlyFile) {
        const file = new File(new Directory(Paths.document, 'documents'), doc.fileUri);
        if (file.exists) file.delete();
      }

      (async () => {
        try {
          if (doc?.serverId) {
            const trip = await tripRepo.getTripById(tripId);
            if (trip?.serverId) {
              await documentsApi.delete(parseInt(trip.serverId), parseInt(doc.serverId));
              await docRepo.removeFromOutbox(id);
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
