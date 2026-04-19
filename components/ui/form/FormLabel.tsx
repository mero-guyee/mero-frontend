import { ComponentProps } from 'react';
import { Text } from 'tamagui';

export default function FormLabel({ ...props }: ComponentProps<typeof Text>) {
  return (
    <Text color="$foreground" fontSize={'$4'} fontWeight="500" {...props}>
      {props.children}
    </Text>
  );
}
