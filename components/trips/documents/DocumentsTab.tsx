import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import { XCard } from '@/components/ui/Card';
import { paddingHorizontalGeneral } from '@/constants/theme';
import { useTrips } from '@/contexts';
import { File, Plus, X } from '@tamagui/lucide-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { FilledButton } from '../../ui';
import EmptyDocuments from './EmptyDocuments';

interface SelectedDocument {
  name: string;
  size: number;
  uri: string;
}

export function DocumentsTab({ tripId }: { tripId: string }) {
  const { createDocument, documents } = useTrips();
  const [selectedDocument, setSelectedDocument] = useState<SelectedDocument>();

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
      });

      if (!result.canceled && result.assets) {
        const { name, size, uri } = result.assets[0];
        setSelectedDocument({ name, size: size!, uri });
      }
    } catch (error) {
      console.error('File selection error:', error);
    }
  };

  const removeFile = (index: number) => {
    setSelectedDocument(undefined);
  };

  return (
    <>
      <ScrollView minHeight={'100%'} maxHeight={'100%'}>
        <YStack paddingHorizontal={paddingHorizontalGeneral} gap="$4">
          {/* File Upload */}
          <YStack>
            {selectedDocument && (
              <YStack marginTop="$4" gap="$2">
                <XCard padding="$3" alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$3" flex={1}>
                    <YStack
                      width={40}
                      height={40}
                      backgroundColor="$accent"
                      borderRadius="$3"
                      alignItems="center"
                      justifyContent="center"
                      opacity={0.4}
                    >
                      <File size={20} color="$foreground" />
                    </YStack>
                    <YStack flex={1}>
                      <Text color="$foreground" fontSize={14} numberOfLines={1}>
                        {selectedDocument.name}
                      </Text>
                      <Text color="$mutedForeground" fontSize={12}>
                        {(selectedDocument.size / 1024).toFixed(1)} KB
                      </Text>
                    </YStack>
                  </XStack>
                  <Pressable onPress={() => removeFile(1)} style={{ padding: 8 }}>
                    <X size={16} color="$destructive" />
                  </Pressable>
                </XCard>

                <FilledButton
                  marginTop="$3"
                  onPress={() =>
                    createDocument(tripId, {
                      fileName: selectedDocument.name,
                      fileUri: selectedDocument.uri,
                    })
                  }
                >
                  <Text color="$foreground" fontWeight="500">
                    업로드
                  </Text>
                </FilledButton>
              </YStack>
            )}
          </YStack>

          {/* Saved Files */}
          <YStack>
            {documents.length > 0 || selectedDocument ? (
              <YStack gap="$2">
                {documents.map((doc, index) => (
                  <XStack
                    key={index}
                    backgroundColor="$card"
                    borderRadius="$4"
                    padding="$3"
                    alignItems="center"
                    justifyContent="space-between"
                    borderWidth={1}
                    borderColor="$border"
                  >
                    <XStack alignItems="center" gap="$3" flex={1}>
                      <YStack
                        width={40}
                        height={40}
                        backgroundColor="$accent"
                        borderRadius="$3"
                        alignItems="center"
                        justifyContent="center"
                        opacity={0.4}
                      >
                        <File size={20} color="$foreground" />
                      </YStack>
                      <YStack flex={1}>
                        <Text color="$foreground" fontSize={14} numberOfLines={1}>
                          {doc.fileName}
                        </Text>
                      </YStack>
                    </XStack>
                    <Pressable onPress={() => removeFile(index)} style={{ padding: 8 }}>
                      <X size={16} color="$destructive" />
                    </Pressable>
                  </XStack>
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
    </>
  );
}
