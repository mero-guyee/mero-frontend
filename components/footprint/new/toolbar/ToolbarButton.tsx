import { Pressable } from 'react-native';
import { GetProps, XStack } from 'tamagui';

export default function ToolbarButton(props: GetProps<typeof Pressable>) {
  return (
    <Pressable {...props} hitSlop={10}>
      <XStack alignItems="center" paddingVertical={'$2'} paddingHorizontal={'$2.5'}>
        {props.children}
      </XStack>
    </Pressable>
  );
}
