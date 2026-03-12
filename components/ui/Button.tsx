import { Button as TamaguiButton, styled } from 'tamagui';

export const FilledButton = styled(TamaguiButton, {
  height: 48,
  borderRadius: '$4',
  backgroundColor: '$accent',
  pressStyle: { backgroundColor: '$accentHover' },
});

export const CircularButton = styled(TamaguiButton, {
  circular: true,
  size: '$4',
  backgroundColor: 'transparent',
  pressStyle: { backgroundColor: '$accent' },
});
