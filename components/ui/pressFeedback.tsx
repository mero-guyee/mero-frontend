import { GetProps, Stack, styled } from 'tamagui';

export const pressFeedbackStyle: GetProps<typeof Stack> = {
  animation: 'fast',
  pressStyle: { scale: 0.97, backgroundColor: '$backgroundPress' },
};

export const pressFeedbackStyleLight: GetProps<typeof Stack> = {
  animation: 'fast',
  pressStyle: { scale: 0.97, backgroundColor: '$backgroundPressLight' },
};

export const PressableStack = styled(Stack, pressFeedbackStyle);

export const PressableStackLight = styled(Stack, pressFeedbackStyleLight);

export const cardScaleStyle = (pressed: boolean): GetProps<typeof Stack> => ({
  animation: 'fast',
  scale: pressed ? 0.97 : 1,
});

export const PressFeedbackBackdrop = ({ pressed }: { pressed: boolean }) => (
  <Stack
    position="absolute"
    top={6}
    left={6}
    right={6}
    bottom={6}
    borderRadius="$4"
    animation="fast"
    backgroundColor={pressed ? '$backgroundPress' : 'rgba(245, 239, 224, 0)'}
  />
);
