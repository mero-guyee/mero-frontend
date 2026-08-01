import AppBottomSheet from '@/components/ui/AppBottomSheet';
import { YCard } from '@/components/ui/Card';
import { pressFeedbackStyle } from '@/components/ui/pressFeedback';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { SyncingResultBadge } from '@/components/ui/SyncingResultBadge';
import { useSyncContext } from '@/contexts';
import { MoreVertical, Pencil, Trash2 } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { Trip } from '../../../types';
import TripCoverImage from '../TripCoverImage';
import TripCoverMeta from '../TripCoverMeta';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showSyncBadge?: boolean;
}

export function TripCard({ trip, onPress, onEdit, onDelete, showSyncBadge = false }: TripCardProps) {
  const { isSyncing } = useSyncContext();
  const [showActions, setShowActions] = useState(false);

  return (
    <YCard marginBottom="$4" onPress={onPress} {...pressFeedbackStyle}>
      <YStack height={180} overflow="hidden" position="relative">
        <TripCoverImage uri={trip.imageUrl} />
        {showSyncBadge && <SyncingResultBadge id={trip.id} />}

        <XStack
          position="absolute"
          top="$2"
          right="$2"
          onPress={(e) => {
            e.stopPropagation();
            setShowActions(true);
          }}
          hitSlop={12}
          backgroundColor="rgba(0,0,0,0.45)"
          borderRadius={999}
          padding="$2.5"
          zIndex={2}
        >
          <MoreVertical size={20} color="white" />
        </XStack>

        <TripCoverMeta
          trip={trip}
          showProgress
          rightSlot={<SyncIndicator status={trip.syncStatus ?? 'pending'} syncing={isSyncing(trip.id)} />}
        />
      </YStack>

      <AppBottomSheet open={showActions} onOpenChange={setShowActions}>
        <XStack
          onPress={() => {
            setShowActions(false);
            onEdit();
          }}
          padding="$4"
          alignItems="center"
          gap="$3"
        >
          <Pencil size={20} color="$foreground" />
          <Text color="$foreground" fontSize={16}>
            수정
          </Text>
        </XStack>
        <XStack
          onPress={() => {
            setShowActions(false);
            onDelete();
          }}
          padding="$4"
          alignItems="center"
          gap="$3"
        >
          <Trash2 size={20} color="$destructiveText" />
          <Text color="$destructiveText" fontSize={16}>
            삭제
          </Text>
        </XStack>
      </AppBottomSheet>
    </YCard>
  );
}
