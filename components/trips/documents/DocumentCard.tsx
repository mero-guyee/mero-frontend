import { XCard } from '@/components/ui/Card';
import {
  Archive,
  File,
  FileCode,
  FileSpreadsheet,
  FileText,
  Image,
  Trash2,
} from '@tamagui/lucide-icons';
import * as Sharing from 'expo-sharing';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

interface FileTypeConfig {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  mime?: string;
  ctg?: 'image' | 'pdf';
}

const FILE_TYPES: Record<string, FileTypeConfig> = {
  pdf: { icon: FileText, mime: 'application/pdf', ctg: 'pdf' },
  doc: { icon: FileText, mime: 'application/msword' },
  docx: {
    icon: FileText,
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  txt: { icon: FileText, mime: 'text/plain' },
  jpg: { icon: Image, ctg: 'image' },
  jpeg: { icon: Image, ctg: 'image' },
  png: { icon: Image, ctg: 'image' },
  xlsx: {
    icon: FileSpreadsheet,
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  csv: { icon: FileSpreadsheet, mime: 'text/csv' },
  md: { icon: FileCode, mime: 'text/markdown' },
  zip: { icon: Archive, mime: 'application/zip' },
};

function getFileType(fileName: string): FileTypeConfig | undefined {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return FILE_TYPES[ext];
}

interface DocumentCardProps {
  name: string;
  fileUri: string;
  onRemove: () => void;
  onImagePress?: (uri: string) => void;
  onPdfPress?: (uri: string) => void;
}

export function DocumentCard({
  name,
  fileUri,
  onRemove,
  onImagePress,
  onPdfPress,
}: DocumentCardProps) {
  const { icon: IconComponent = File, mime, ctg } = getFileType(name) ?? {};

  const handlePress = async () => {
    if (ctg === 'image') {
      onImagePress?.(fileUri);
      return;
    }
    if (ctg === 'pdf') {
      onPdfPress?.(fileUri);
      return;
    }
    if (!(await Sharing.isAvailableAsync())) return;
    await Sharing.shareAsync(fileUri, {
      mimeType: mime ?? 'application/octet-stream',
      dialogTitle: name,
    });
  };

  return (
    <Pressable onPress={handlePress}>
      <XCard
        backgroundColor="$card"
        padding="$3"
        alignItems="center"
        justifyContent="space-between"
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
            <IconComponent size={20} color="$foreground" />
          </YStack>
          <YStack flex={1}>
            <Text color="$foreground" fontSize={14} numberOfLines={1}>
              {name}
            </Text>
          </YStack>
        </XStack>
        <Pressable onPress={onRemove} style={{ padding: 8 }}>
          <Trash2 size={16} color="$destructive" />
        </Pressable>
      </XCard>
    </Pressable>
  );
}
