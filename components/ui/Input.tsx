import { GetProps, Stack, Input as TamaguiInput, styled } from 'tamagui';

export const inputStyle: GetProps<typeof Stack> = {
  backgroundColor: '$transparent',
  borderWidth: 1.5,
  borderColor: '$foreground',
  borderRadius: '$2',
  height: 48,
  paddingHorizontal: '$3',
  paddingVertical: '$2.5',
};

export const inputTextColor = 'foreground';

export const Input = styled(TamaguiInput, {
  color: '$foreground',
  backgroundColor: '$transparent',
  borderWidth: 1.5,
  borderColor: '$foreground',
  borderRadius: '$2',
  height: 48,
  placeholderTextColor: '$mutedForeground',
  paddingHorizontal: '$3',
  paddingVertical: '$2.5',
  focusStyle: {
    borderColor: '$foreground',
  },
});
