import { MoreVertical } from '@tamagui/lucide-icons';
import { useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useRef, useState } from 'react';
import { Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Portal, View } from 'tamagui';
import { IconButton } from './button/BaseButton';

const DURATION = 100;

export default function More({ children }: { children: ReactNode }) {
  const [showMenu, setShowMenu] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const menuTop = insets.top + 44;
  const menuRight = 16;

  const openMenu = () => {
    setShowMenu(true);
    Animated.timing(opacity, { toValue: 1, duration: DURATION, useNativeDriver: true }).start();
  };

  const closeMenu = () => {
    Animated.timing(opacity, { toValue: 0, duration: DURATION, useNativeDriver: true }).start(() =>
      setShowMenu(false)
    );
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        opacity.setValue(0);
        setShowMenu(false);
      };
    }, [opacity])
  );

  return (
    <>
      <IconButton onPress={openMenu}>
        <MoreVertical size="$7" color="$foreground" />
      </IconButton>

      {showMenu && (
        <Portal>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99,
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={closeMenu} />
            <Animated.View
              style={{
                position: 'absolute',
                top: menuTop,
                right: menuRight,
                minWidth: 120,
                backgroundColor: '#fff',
                borderRadius: 8,
                overflow: 'hidden',
                zIndex: 100,
                opacity,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {children}
            </Animated.View>
          </View>
        </Portal>
      )}
    </>
  );
}
