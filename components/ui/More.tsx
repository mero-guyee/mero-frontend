import { MoreVertical } from '@tamagui/lucide-icons';
import { useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, View } from 'react-native';
import { YStack } from 'tamagui';
import { CircularButton } from './Button';

interface MenuPosition {
  top: number;
  right: number;
}

export default function More({ children }: { children: ReactNode }) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition>({ top: 0, right: 0 });
  const buttonRef = useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      return () => setShowMenu(false);
    }, [])
  );

  const openMenu = () => {
    buttonRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      const screenWidth = Dimensions.get('window').width;
      setMenuPos({
        top: pageY + height,
        right: screenWidth - pageX - width,
      });
      setShowMenu(true);
    });
  };

  return (
    <>
      <View ref={buttonRef}>
        <CircularButton onPress={openMenu}>
          <MoreVertical size={20} color="$foreground" />
        </CircularButton>
      </View>

      <Modal
        visible={showMenu}
        transparent
        animationType="none"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setShowMenu(false)} />
        <YStack
          position="absolute"
          top={menuPos.top}
          right={menuPos.right}
          width={180}
          backgroundColor="$card"
          borderRadius="$4"
          overflow="hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {children}
        </YStack>
      </Modal>
    </>
  );
}
