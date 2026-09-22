import { ApiError } from '@/api/client';
import { documentsApi } from '@/api/documents';
import { SyncingCallbacks } from '@/contexts/SyncingContext';
import { enqueueMutation } from '@/hooks/queries/mutationQueue';
import { DocumentRepository, OutboxRepository, TripRepository } from '@/repositories';
import { resolveAbsoluteFileUri } from '@/repositories/documents';
import * as SQLite from 'expo-sqlite';

export async function syncDocuments(
  db: SQLite.SQLiteDatabase,
  maxAgeMinutes?: number,
  syncing?: SyncingCallbacks
): Promise<boolean> {
  const docRepo = new DocumentRepository(db);
  const tripRepo = new TripRepository(db);
  const outbox = new OutboxRepository(db);
  const ready = await outbox.getReady('documents', maxAgeMinutes);

  for (const { dataId, operation } of ready) {
    await enqueueMutation(dataId, async () => {
      syncing?.markSyncing(dataId);
      try {
        if (operation === 'create') {
          const doc = await docRepo.findById(dataId);
          if (!doc || doc.serverId || doc.deletedAt) {
            await outbox.remove('documents', dataId);
            return;
          }
          const trip = await tripRepo.findById(doc.tripId);
          if (!trip?.serverId) {
            return;
          }
          const serverDoc = await documentsApi.upload({
            tripId: parseInt(trip.serverId),
            clientId: doc.id,
            file: { fileName: doc.fileName, fileUri: resolveAbsoluteFileUri(doc.fileUri) },
          });
          await docRepo.setServerId(doc.id, String(serverDoc.id));
          syncing?.markSyncingSucceeded(dataId);
        } else if (operation === 'update') {
          const doc = await docRepo.findById(dataId);
          if (!doc?.serverId) {
            await outbox.remove('documents', dataId);
            return;
          }
          const trip = await tripRepo.findById(doc.tripId);
          if (!trip?.serverId) {
            return;
          }
          await documentsApi.update(parseInt(trip.serverId), parseInt(doc.serverId), {
            fileName: doc.fileName,
          });
          await docRepo.markSynced(dataId);
          syncing?.markSyncingSucceeded(dataId);
        } else if (operation === 'delete') {
          const doc = await docRepo.findByIdIncludeDeleted(dataId);
          if (!doc?.serverId) {
            await outbox.remove('documents', dataId);
            return;
          }
          const trip = await tripRepo.findById(doc.tripId);
          if (!trip?.serverId) {
            return;
          }
          await documentsApi.delete(parseInt(trip.serverId), parseInt(doc.serverId));
          await outbox.remove('documents', dataId);
        }
      } catch (e) {
        if (operation === 'delete' && e instanceof ApiError && e.status === 404) {
          await outbox.remove('documents', dataId);
          syncing?.markSyncingSucceeded(dataId);
        } else {
          await outbox.markFailed('documents', dataId);
          syncing?.markSyncingFailed(dataId);
        }
      } finally {
        syncing?.unmarkSyncing(dataId);
      }
    });
  }

  return ready.length > 0;
}
