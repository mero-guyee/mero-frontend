import { GetProps, Stack, Input as TamaguiInput, XStack, styled } from 'tamagui';

export const inputStyle: GetProps<typeof Stack> = {
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: '$foreground',
  borderRadius: '$2',
  height: 48,
  paddingHorizontal: '$3',
  paddingVertical: '$2.5',
};

export const InputBox = styled(XStack, {
  ...inputStyle,
  alignItems: 'center',

  variants: {
    active: {
      true: { borderColor: '$accentStrong' },
    },
  } as const,
});

export const inputTextColor = 'foreground';

export const Input = styled(TamaguiInput, {
  color: '$foreground',
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: '$foreground',
  borderRadius: '$2',
  height: 48,
  placeholderTextColor: '$placeholderForeground',
  paddingHorizontal: '$3',
  paddingVertical: '$2.5',
  focusStyle: {
    borderColor: '$accentStrong',
  },
});
