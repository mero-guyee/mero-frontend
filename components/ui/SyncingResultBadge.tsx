import { AnimatePresence } from '@tamagui/animate-presence';
import { AlertCircle, Check } from '@tamagui/lucide-icons';
import { useEffect, useState } from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Spinner, Text, XStack, styled } from 'tamagui';
import { useSyncContext } from '../../contexts/SyncContext';

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
    zIndex: 2,
    height: 24,
  })
);

type DisplayState = 'syncing' | 'syncSucceeded' | 'syncFailed';

function getDisplayState(
  syncing: boolean,
  syncSucceeded: boolean,
  syncFailed: boolean
): DisplayState | null {
  if (syncing) return 'syncing';
  if (syncSucceeded) return 'syncSucceeded';
  if (syncFailed) return 'syncFailed';
  return null;
}

interface SyncingResultBadgeProps {
  id: string;
}

export function SyncingResultBadge({ id }: SyncingResultBadgeProps) {
  const { isSyncing, isSyncSucceeded, clearSyncSucceeded, isSyncFailed, clearSyncFailed } =
    useSyncContext();
  const syncing = isSyncing(id);

  const syncSucceeded = isSyncSucceeded(id);
  const syncFailed = isSyncFailed(id);
  const displayState = getDisplayState(syncing, syncSucceeded, syncFailed);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!syncSucceeded) return;
    const timer = setTimeout(() => clearSyncSucceeded(id), 1500);
    return () => clearTimeout(timer);
  }, [syncSucceeded, id, clearSyncSucceeded]);

  useEffect(() => {
    if (!syncFailed) return;
    const timer = setTimeout(() => clearSyncFailed(id), 1500);
    return () => clearTimeout(timer);
  }, [syncFailed, id, clearSyncFailed]);

  useEffect(() => {
    if (!displayState) {
      setHidden(false);
      return;
    }
    setHidden(false);
    const timer = setTimeout(() => setHidden(true), 1500);
    return () => clearTimeout(timer);
  }, [displayState]);

  return (
    <AnimatePresence>
      {displayState && !hidden && (
        <AnimatedXStack
          key="badge"
          layout={LinearTransition.springify().damping(20).stiffness(200)}
          animation="fast"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        >
          <AnimatePresence>
            {displayState === 'syncSucceeded' && (
              <XStack key="check" animation="fast" enterStyle={{ scale: 0 }}>
                <Check size={14} color="white" />
              </XStack>
            )}
            {displayState === 'syncFailed' && (
              <XStack key="alert" animation="fast" enterStyle={{ scale: 0 }}>
                <AlertCircle size={14} color="white" />
              </XStack>
            )}
            {displayState === 'syncing' && (
              <XStack key="spinner">
                <Spinner size="small" color="white" />
              </XStack>
            )}
          </AnimatePresence>
          {displayState === 'syncing' && (
            <Text color="white" fontSize={11}>
              동기화 중
            </Text>
          )}
          {displayState === 'syncFailed' && (
            <Text color="white" fontSize={11}>
              동기화 실패
            </Text>
          )}
        </AnimatedXStack>
      )}
    </AnimatePresence>
  );
}
