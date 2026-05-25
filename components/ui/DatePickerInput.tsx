import { paddingHorizontalGeneral } from '@/constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet, Text, XStack } from 'tamagui';
import { inputStyle } from './Input';
import { FilledButton } from './button/BaseButton';

interface DatePickerInputProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  renderTrigger?: (onPress: () => void) => React.ReactNode;
}

export default function DatePickerInput({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  renderTrigger,
}: DatePickerInputProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value ? new Date(value) : new Date());
  const insets = useSafeAreaInsets();

  const handleOpen = () => {
    setTempDate(value ? new Date(value) : new Date());
    setShow(true);
  };

  const handleSpinnerChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) setTempDate(selectedDate);
  };

  const handleConfirm = () => {
    onChange(tempDate.toISOString().split('T')[0]);
    setShow(false);
  };

  const handleAndroidChange = (event: any, selectedDate?: Date) => {
    setShow(false);
    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger(handleOpen)
      ) : (
        <Pressable onPress={handleOpen}>
          <XStack alignItems="center" {...inputStyle}>
            <Text color={value ? '$foreground' : '$mutedForeground'}>{value || placeholder}</Text>
          </XStack>
        </Pressable>
      )}

      {Platform.OS === 'ios' ? (
        <Sheet modal open={show} onOpenChange={setShow} snapPointsMode="fit" dismissOnSnapToBottom>
          <Sheet.Overlay
            animation="lazy"
            bg="rgba(0,0,0,0.5)"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Sheet.Handle />
          <Sheet.Frame
            paddingBottom={insets.bottom || 8}
            paddingHorizontal={paddingHorizontalGeneral * 2}
          >
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleSpinnerChange}
              style={{ height: 200 }}
            />

            <FilledButton color="$accent" fontWeight="600" fontSize={16} onPress={handleConfirm}>
              <Text>완료</Text>
            </FilledButton>
          </Sheet.Frame>
        </Sheet>
      ) : (
        show && (
          <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode="date"
            display="default"
            onChange={handleAndroidChange}
          />
        )
      )}
    </>
  );
}
