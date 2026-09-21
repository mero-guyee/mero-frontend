import { getFileType } from '@/components/trips/documents/DocumentCard';
import DocumentNameSheet from '@/components/trips/documents/DocumentNameSheet';
import { IconButton } from '@/components/ui/button/BaseButton';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { File as FileIcon, Pencil, Share2, Trash2 } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { WebView } from 'react-native-webview';
import { Image, Text, XStack, YStack } from 'tamagui';
import { useAppModal, useTrips } from '../../../contexts';

export default function DocumentDetailScreen() {
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  const router = useRouter();
  const { documents, updateDocument, deleteDocument } = useTrips();
  const { showConfirm } = useAppModal();
  const [isRenameSheetOpen, setIsRenameSheetOpen] = useState(false);

  const document = documents.find((doc) => doc.id === documentId);
  const { mime, ctg } = (document && getFileType(document.fileUri)) ?? {};

  const handleDelete = async () => {
    if (!document) return;
    const confirmed = await showConfirm('서류 삭제', '이 서류를 삭제하시겠습니까?', {
      confirmText: '삭제',
      destructive: true,
    });
    if (!confirmed) return;
    deleteDocument(document.id);
    router.back();
  };

  const handleShare = async () => {
    if (!document) return;
    if (!(await Sharing.isAvailableAsync())) return;
    await Sharing.shareAsync(document.fileUri, {
      mimeType: mime ?? 'application/octet-stream',
      dialogTitle: document.fileName,
    });
  };

  if (!document) return null;

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader onBack={() => router.back()} label={document.fileName}>
        <XStack alignItems="center" gap="$3">
          <IconButton onPress={() => setIsRenameSheetOpen(true)} hitSlop={10}>
            <Pencil size="$6.5" color="$foreground" />
          </IconButton>
          <IconButton onPress={handleShare} hitSlop={10}>
            <Share2 size="$6.5" color="$foreground" />
          </IconButton>
          <IconButton onPress={handleDelete} hitSlop={10}>
            <Trash2 size="$6.5" color="$destructiveText" />
          </IconButton>
        </XStack>
      </BackActionHeader>
      <DocumentNameSheet
        open={isRenameSheetOpen}
        onOpenChange={setIsRenameSheetOpen}
        title="파일 이름 수정"
        defaultValue={document.fileName}
        confirmText="수정"
        onConfirm={(fileName) => updateDocument(document.id, fileName)}
      />
      <YStack flex={1}>
        {ctg === 'image' && (
          <YStack flex={1} backgroundColor="black">
            <Image
              source={{ uri: document.fileUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </YStack>
        )}
        {ctg === 'pdf' && (
          <WebView
            source={{ uri: document.fileUri }}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            allowingReadAccessToURL={document.fileUri}
          />
        )}
        {!ctg && (
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$3">
            <FileIcon size={48} color="$mutedForeground" />
            <Text color="$foreground">{document.fileName}</Text>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
}
