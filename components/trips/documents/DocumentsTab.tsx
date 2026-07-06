import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import { PdfModal } from '@/components/ui/PdfModal';
import { PhotoModal } from '@/components/ui/PhotoModal';
import { paddingHorizontalGeneral } from '@/constants/theme';
import { useTrips } from '@/contexts';
import { Plus } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import DocumentAddSheet from './DocumentAddSheet';
import { DocumentCard } from './DocumentCard';
import EmptyDocuments from './EmptyDocuments';

export function DocumentsTab({ tripId }: { tripId: string }) {
  const { createDocument, documents, deleteDocument } = useTrips();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [isSourceSheetOpen, setIsSourceSheetOpen] = useState(false);

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
                    name={doc.fileName}
                    fileUri={doc.fileUri}
                    onRemove={() => deleteDocument(doc.id)}
                    onImagePress={setSelectedImage}
                    onPdfPress={setSelectedPdf}
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
      <PhotoModal uri={selectedImage} onClose={() => setSelectedImage(null)} />
      <PdfModal uri={selectedPdf} onClose={() => setSelectedPdf(null)} />
      <DocumentAddSheet
        open={isSourceSheetOpen}
        onOpenChange={setIsSourceSheetOpen}
        onSelect={(file) => createDocument(tripId, file)}
      />
    </>
  );
}
