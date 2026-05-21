import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import { PhotoModal } from '@/components/ui/PhotoModal';
import { paddingHorizontalGeneral } from '@/constants/theme';
import { useTrips } from '@/contexts';
import { Plus } from '@tamagui/lucide-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { DocumentCard } from './DocumentCard';
import EmptyDocuments from './EmptyDocuments';

export function DocumentsTab({ tripId }: { tripId: string }) {
  const { createDocument, documents, deleteDocument } = useTrips();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
      });

      if (!result.canceled && result.assets) {
        const { name, uri } = result.assets[0];
        createDocument(tripId, { fileName: name, fileUri: uri });
      }
    } catch (error) {
      console.error('File selection error:', error);
    }
  };

  return (
    <>
      <ScrollView minHeight={'100%'} maxHeight={'100%'}>
        <YStack paddingHorizontal={paddingHorizontalGeneral} gap="$4">
          <YStack>
            {documents.length > 0 ? (
              <YStack gap="$2">
                {documents.map((doc, index) => (
                  <DocumentCard
                    key={index}
                    name={doc.fileName}
                    fileUri={doc.fileUri}
                    onRemove={() => deleteDocument(doc.id)}
                    onImagePress={setSelectedImage}
                  />
                ))}
              </YStack>
            ) : (
              <EmptyDocuments />
            )}
          </YStack>
        </YStack>
      </ScrollView>
      <FloatingActionButton onPress={handleFileSelect}>
        <XStack alignItems="center" gap="$2">
          <Plus />
          <Text>서류 추가</Text>
        </XStack>
      </FloatingActionButton>
      <PhotoModal uri={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  );
}
