import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import { paddingHorizontalGeneral } from '@/constants/theme';
import { useTrips } from '@/contexts';
import { Plus } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import DocumentAddSheet from './DocumentAddSheet';
import { DocumentCard } from './DocumentCard';
import EmptyDocuments from './EmptyDocuments';

export function DocumentsTab({ tripId }: { tripId: string }) {
  const { createDocument, documents } = useTrips();
  const [isSourceSheetOpen, setIsSourceSheetOpen] = useState(false);

  const handleOpenDocument = (documentId: string) => {
    router.push({
      pathname: '/backpack/document-detail',
      params: { documentId },
    } as any);
  };

  return (
    <>
      <ScrollView minHeight={'100%'} maxHeight={'100%'}>
        <YStack paddingHorizontal={paddingHorizontalGeneral} gap="$4">
          <YStack>
            {documents.length > 0 ? (
              <YStack gap="$2">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    id={doc.id}
                    name={doc.fileName}
                    syncStatus={doc.syncStatus}
                    onPress={() => handleOpenDocument(doc.id)}
                  />
                ))}
              </YStack>
            ) : (
              <EmptyDocuments />
            )}
          </YStack>
        </YStack>
      </ScrollView>
      <FloatingActionButton onPress={() => setIsSourceSheetOpen(true)}>
        <XStack alignItems="center" gap="$2">
          <Plus />
          <Text>서류 추가</Text>
        </XStack>
      </FloatingActionButton>
      <DocumentAddSheet
        open={isSourceSheetOpen}
        onOpenChange={setIsSourceSheetOpen}
        onSelect={(file) => createDocument(tripId, file)}
      />
    </>
  );
}
