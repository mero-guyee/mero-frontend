import { AnimatePresence } from '@tamagui/animate-presence';
import { Check } from '@tamagui/lucide-icons';
import { useEffect, useState } from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Spinner, Text, XStack, styled } from 'tamagui';

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

interface SyncBadgeProps {
  synced?: boolean;
}

export function SyncBadge({ synced = false }: SyncBadgeProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (synced) {
      const timer = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [synced]);

  return (
    <AnimatePresence>
      {visible && (
        <AnimatedXStack
          key="badge"
          layout={LinearTransition.springify().damping(20).stiffness(200)}
          animation="fast"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        >
          <AnimatePresence>
            {synced ? (
              <XStack key="check" animation="fast" enterStyle={{ scale: 0 }}>
                <Check size={14} color="white" />
              </XStack>
            ) : (
              <XStack key="spinner">
                <Spinner size="small" color="white" />
              </XStack>
            )}
          </AnimatePresence>
          {!synced && (
            <Text color="white" fontSize={11}>
              동기화 중
            </Text>
          )}
        </AnimatedXStack>
      )}
    </AnimatePresence>
  );
}
