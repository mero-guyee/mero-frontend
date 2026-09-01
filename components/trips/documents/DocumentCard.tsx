import { XCard } from '@/components/ui/Card';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { SyncingResultBadge } from '@/components/ui/SyncingResultBadge';
import { Archive, File, FileCode, FileSpreadsheet, FileText, Image } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

export interface FileTypeConfig {
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

export function getFileType(fileName: string): FileTypeConfig | undefined {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return FILE_TYPES[ext];
}

interface DocumentCardProps {
  id: string;
  name: string;
  syncStatus?: 'pending' | 'synced';
  onPress: () => void;
}

export function DocumentCard({ id, name, syncStatus, onPress }: DocumentCardProps) {
  const { icon: IconComponent = File } = getFileType(name) ?? {};

  return (
    <Pressable onPress={onPress}>
      <XCard
        backgroundColor="$card"
        padding="$3"
        alignItems="center"
        justifyContent="space-between"
        position="relative"
      >
        <SyncingResultBadge id={id} />
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
        <SyncIndicator status={syncStatus ?? 'pending'} />
      </XCard>
    </Pressable>
  );
}
