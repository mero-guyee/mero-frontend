import { FilledButton, FormInputBox, Input } from '@/components/ui';
import AppBottomSheet from '@/components/ui/AppBottomSheet';
import { useEffect, useState } from 'react';
import { Text, XStack } from 'tamagui';

const MAX_FILE_NAME_LENGTH = 255;

interface DocumentNameSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValue: string;
  confirmText: string;
  onConfirm: (fileName: string) => void;
}

export default function DocumentNameSheet({
  open,
  onOpenChange,
  title,
  defaultValue,
  confirmText,
  onConfirm,
}: DocumentNameSheetProps) {
  const [fileName, setFileName] = useState(defaultValue);

  useEffect(() => {
    if (open) setFileName(defaultValue);
  }, [open, defaultValue]);

  const trimmed = fileName.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= MAX_FILE_NAME_LENGTH;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(trimmed);
    onOpenChange(false);
  };

  return (
    <AppBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      frameProps={{ padding: '$5', gap: '$4' }}
    >
      <Text color="$foreground" fontSize={18} fontWeight="600">
        {title}
      </Text>

      <FormInputBox>
        {(focusProps) => (
          <Input
            flex={1}
            placeholder="파일 이름을 입력해주세요"
            placeholderTextColor="$placeholderForeground"
            value={fileName}
            onChangeText={setFileName}
            autoFocus
            color="$foreground"
            borderWidth={0}
            height={44}
            focusStyle={{ borderWidth: 0 }}
            {...focusProps}
          />
        )}
      </FormInputBox>

      <XStack gap="$3">
        <FilledButton
          flex={1}
          backgroundColor="$muted"
          pressStyle={{ backgroundColor: '$mutedPress' }}
          onPress={() => onOpenChange(false)}
        >
          <Text color="$foreground">취소</Text>
        </FilledButton>
        <FilledButton flex={1} onPress={handleConfirm} disabled={!isValid} opacity={isValid ? 1 : 0.5}>
          <Text color="$foreground">{confirmText}</Text>
        </FilledButton>
      </XStack>
    </AppBottomSheet>
  );
}
