import { AnimatePresence } from '@tamagui/animate-presence';
import { AlertCircle, Check, CloudOff } from '@tamagui/lucide-icons';
import { useEffect } from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Spinner, Text, XStack, styled } from 'tamagui';
import { useSyncContext } from '../../contexts/SyncContext';
import type { SyncStatus } from '../../repositories/base';

const AnimatedXStack = Animated.createAnimatedComponent(
  styled(XStack, {
    position: 'absolute',
    top: '$2',
    right: '$2',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    paddingHorizontal: '$2',
    paddingVertical: '$1',
    alignItems: 'center',
    gap: '$1.5',
    height: 24,
  })
);

type DisplayState = 'justSynced' | 'syncing' | 'pending' | 'conflict';

function getDisplayState(
  status: SyncStatus,
  syncing: boolean,
  justSynced: boolean
): DisplayState | null {
  if (status === 'conflict') return 'conflict';
  if (justSynced) return 'justSynced';
  if (status === 'synced') return null;
  return syncing ? 'syncing' : 'pending';
}

interface SyncingResultBadgeProps {
  id: string;
  status: SyncStatus;
}

export function SyncingResultBadge({ id, status }: SyncingResultBadgeProps) {
  const { isSyncing, isJustSynced, clearJustSynced } = useSyncContext();
  const syncing = isSyncing(id);
  const justSynced = isJustSynced(id);
  const displayState = getDisplayState(status, syncing, justSynced);

  useEffect(() => {
    if (!justSynced) return;
    const timer = setTimeout(() => clearJustSynced(id), 1500);
    return () => clearTimeout(timer);
  }, [justSynced, id, clearJustSynced]);

  return (
    <AnimatePresence>
      {displayState && (
        <AnimatedXStack
          key="badge"
          layout={LinearTransition.springify().damping(20).stiffness(200)}
          animation="fast"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        >
          <AnimatePresence>
            {displayState === 'justSynced' && (
              <XStack key="check" animation="fast" enterStyle={{ scale: 0 }}>
                <Check size={14} color="white" />
              </XStack>
            )}
            {displayState === 'conflict' && (
              <XStack key="alert" animation="fast" enterStyle={{ scale: 0 }}>
                <AlertCircle size={14} color="white" />
              </XStack>
            )}
            {displayState === 'syncing' && (
              <XStack key="spinner">
                <Spinner size="small" color="white" />
              </XStack>
            )}
            {displayState === 'pending' && (
              <XStack key="cloud-off" animation="fast" enterStyle={{ scale: 0 }}>
                <CloudOff size={14} color="white" />
              </XStack>
            )}
          </AnimatePresence>
          {displayState === 'syncing' && (
            <Text color="white" fontSize={11}>
              동기화 중
            </Text>
          )}
          {displayState === 'pending' && (
            <Text color="white" fontSize={11}>
              미동기화
            </Text>
          )}
          {displayState === 'conflict' && (
            <Text color="white" fontSize={11}>
              동기화 실패
            </Text>
          )}
        </AnimatedXStack>
      )}
    </AnimatePresence>
  );
}
