import { Input as TamaguiInput, styled } from 'tamagui';

export const Input = styled(TamaguiInput, {
  color: '$foreground',
  backgroundColor: '$muted',
  borderWidth: 2,
  borderColor: '$border',
  borderRadius: '$4',
  placeholderTextColor: '$mutedForeground',
  height: 48,
});
