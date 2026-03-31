import { MoreVertical } from '@tamagui/lucide-icons';
import { useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useState } from 'react';
import { YStack } from 'tamagui';
import { CircularButton } from './Button';

export default function More({ children }: { children: ReactNode }) {
  const [showMenu, setShowMenu] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => setShowMenu(false);
    }, [])
  );

  return (
    <YStack position="relative">
      <CircularButton onPress={() => setShowMenu(!showMenu)}>
        <MoreVertical size={20} color="$foreground" />
      </CircularButton>
      {showMenu && (
        <YStack
          position="absolute"
          top={44}
          right={0}
          width={180}
          backgroundColor="$card"
          borderRadius="$4"
          overflow="hidden"
          zIndex={100}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={() => setShowMenu(false)}
        >
          {children}
        </YStack>
      )}
    </YStack>
  );
}
