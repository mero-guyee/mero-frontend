import { useAutoFocusOnMount } from '@/hooks/useAutoFocusOnMount';
import { ComponentRef, useRef, useState } from 'react';
import { GetProps, TextArea as TamaguiTextArea } from 'tamagui';
import { Input, InputBox } from './Input';

type FormInputProps =
  | ({ multiline?: false; autoFocus?: boolean } & GetProps<typeof Input>)
  | ({ multiline: true; autoFocus?: boolean } & GetProps<typeof TamaguiTextArea>);

export function FormInput({ multiline, autoFocus = false, ...props }: FormInputProps) {
  const inputRef = useRef<ComponentRef<typeof Input> & ComponentRef<typeof TamaguiTextArea>>(null);
  useAutoFocusOnMount(inputRef, autoFocus);

  if (multiline) {
    return <TamaguiTextArea ref={inputRef} {...(props as GetProps<typeof TamaguiTextArea>)} />;
  }
  return <Input ref={inputRef} {...(props as GetProps<typeof Input>)} />;
}

export function FormInputBox({
  children,
  ...boxProps
}: {
  children: (focusProps: { onFocus: () => void; onBlur: () => void }) => React.ReactNode;
} & GetProps<typeof InputBox>) {
  const [focused, setFocused] = useState(false);
  return (
    <InputBox active={focused} {...boxProps}>
      {children({ onFocus: () => setFocused(true), onBlur: () => setFocused(false) })}
    </InputBox>
  );
}
