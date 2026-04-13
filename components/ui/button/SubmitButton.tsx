import { ComponentProps } from 'react';
import { Text } from 'tamagui';
import { FilledButton } from './BaseButton';

export default function SubmitButton(props: Omit<ComponentProps<typeof FilledButton>, 'children'>) {
  return (
    <FilledButton {...props} height="$10">
      <Text color="$foreground" fontWeight="500">
        저장
      </Text>
    </FilledButton>
  );
}
