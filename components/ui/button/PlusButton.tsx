import { ComponentProps } from 'react';
import { FilledButton } from './BaseButton';

export default function PlusButton(props: ComponentProps<typeof FilledButton>) {
  return <FilledButton {...props} />;
}
