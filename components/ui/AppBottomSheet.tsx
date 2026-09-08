import { paddingHorizontalGeneral } from '@/constants/theme';
import { ComponentProps, ReactNode, useEffect } from 'react';
import { BackHandler, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet } from 'tamagui';

type FrameProps = ComponentProps<typeof Sheet.Frame>;

interface AppBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  snapPoints?: number[];
  dismissOnSnapToBottom?: boolean;
  dismissOnOverlayPress?: boolean;
  frameProps?: FrameProps;
  zIndex?: number;
  sheetKey?: string;
}

export default function AppBottomSheet({
  open,
  onOpenChange,
  children,
  snapPoints,
  dismissOnSnapToBottom = true,
  dismissOnOverlayPress,
  frameProps,
  zIndex,
  sheetKey,
}: AppBottomSheetProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!open) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onOpenChange(false);
      return true;
    });
    return () => subscription.remove();
  }, [open, onOpenChange]);

  return (
    <Sheet
      key={sheetKey}
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPointsMode={snapPoints ? undefined : 'fit'}
      snapPoints={snapPoints}
      dismissOnSnapToBottom={dismissOnSnapToBottom}
      dismissOnOverlayPress={dismissOnOverlayPress}
      zIndex={zIndex}
    >
      <Sheet.Overlay
        animation="lazy"
        bg="rgba(0,0,0,0.6)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        onPress={() => Keyboard.dismiss()}
      />
      <Sheet.Handle />
      <Sheet.Frame {...frameProps} paddingBottom={insets.bottom + paddingHorizontalGeneral}>
        {children}
      </Sheet.Frame>
    </Sheet>
  );
}
