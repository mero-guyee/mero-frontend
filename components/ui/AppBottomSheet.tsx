import { ComponentProps, ReactNode } from 'react';
import { Keyboard } from 'react-native';
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
}

export default function AppBottomSheet({
  open,
  onOpenChange,
  children,
  snapPoints,
  dismissOnSnapToBottom = true,
  dismissOnOverlayPress,
  frameProps,
}: AppBottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPointsMode={snapPoints ? undefined : 'fit'}
      snapPoints={snapPoints}
      dismissOnSnapToBottom={dismissOnSnapToBottom}
      dismissOnOverlayPress={dismissOnOverlayPress}
    >
      <Sheet.Overlay
        animation="lazy"
        bg="rgba(0,0,0,0.6)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        onPress={() => Keyboard.dismiss()}
      />
      <Sheet.Handle />
      <Sheet.Frame paddingBottom={insets.bottom || 8} {...frameProps}>
        {children}
      </Sheet.Frame>
    </Sheet>
  );
}
