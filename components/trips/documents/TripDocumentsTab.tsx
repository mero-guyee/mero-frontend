import { tripsApi } from '@/api';
import { File, Upload, X } from '@tamagui/lucide-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { FilledButton } from '../../ui';

interface SelectedDocument {
  name: string;
  size: number;
  uri: string;
}

export function TripDocumentsTab({ tripId }: { tripId: string }) {
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

  const removeFile = (index: number) => {};

  return (
    <YStack gap="$6">
      {/* File Upload */}
      <YStack>
        <Text color="$foreground" fontSize={14} marginBottom="$3">
          파일 업로드
        </Text>

        <Pressable onPress={handleFileSelect}>
          <YStack
            borderWidth={2}
            borderStyle="dashed"
            borderColor="$primary"
            borderRadius="$6"
            padding="$8"
            alignItems="center"
            backgroundColor="$card"
            opacity={0.4}
          >
            <YStack
              width={48}
              height={48}
              backgroundColor="$accent"
              borderRadius="$4"
              alignItems="center"
              justifyContent="center"
              marginBottom="$3"
              opacity={0.3}
            >
              <Upload size={24} color="$primary" />
            </YStack>
            <Text color="$mutedForeground" fontSize={14}>
              PDF, JPG, PNG 파일 (10MB 이하)
            </Text>
            <YStack marginTop="$3">
              <YStack
                backgroundColor="$accent"
                paddingHorizontal="$6"
                paddingVertical="$2.5"
                borderRadius="$4"
              >
                <Text color="$foreground">파일 선택</Text>
              </YStack>
            </YStack>
          </YStack>
        </Pressable>

        {selectedDocument && (
          <YStack marginTop="$4" gap="$2">
            <XStack
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
            </XStack>

            <FilledButton
              marginTop="$3"
              onPress={() =>
                tripsApi.uploadDocument(
                  parseInt(tripId),
                  selectedDocument.uri,
                  selectedDocument.name
                )
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
        <Text color="$foreground" fontSize={14} marginBottom="$3">
          저장된 파일
        </Text>
        <YStack
          backgroundColor="$card"
          borderRadius="$6"
          padding="$4"
          gap="$2"
          borderWidth={1}
          borderColor="$border"
        >
          <Text textAlign="center" color="$mutedForeground" paddingVertical="$4">
            아직 저장된 파일이 없습니다
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
