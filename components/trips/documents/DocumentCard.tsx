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
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);

const EXTENSION_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  jpg: Image,
  jpeg: Image,
  png: Image,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  md: FileCode,
  zip: Archive,
};

function getIconByFileName(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_ICONS[ext] ?? File;
}

interface DocumentCardProps {
  name: string;
  fileUri: string;
  onRemove: () => void;
  onImagePress?: (uri: string) => void;
}

export function DocumentCard({ name, fileUri, onRemove, onImagePress }: DocumentCardProps) {
  const IconComponent = getIconByFileName(name);
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const isImage = IMAGE_EXTENSIONS.has(ext);

  return (
    <Pressable onPress={isImage ? () => onImagePress?.(fileUri) : undefined}>
      <XCard
        backgroundColor="$card"
        borderRadius="$4"
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
