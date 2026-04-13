import { Button as TamaguiButton, styled } from 'tamagui';

export const FilledButton = styled(TamaguiButton, {
  height: '$12',
  borderRadius: '$4',
  borderWidth: 0,
  backgroundColor: '$accent',
  pressStyle: { backgroundColor: '$accentHover' },
});

export const CircularButton = styled(TamaguiButton, {
  circular: true,
  size: '$4',
  borderWidth: 0,
  backgroundColor: 'transparent',
  pressStyle: { borderWidth: 0 },
});

export const IconButton = styled(FilledButton, {
  size: '$2',
  height: '$12',
  borderRadius: '$4',
  backgroundColor: 'transparent',
  pressStyle: { backgroundColor: '$backgroundPress' },
});
