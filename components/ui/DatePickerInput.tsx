import { paddingHorizontalGeneral } from '@/constants/theme';
import { isIos } from '@/utils/platform';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, XStack } from 'tamagui';
import { useTheme } from '../../contexts';
import AppBottomSheet from './AppBottomSheet';
import { inputStyle } from './Input';
import { FilledButton } from './button/BaseButton';

interface DatePickerInputProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  renderTrigger?: (onPress: () => void) => React.ReactNode;
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function DatePickerInput({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  renderTrigger,
  minimumDate,
  maximumDate,
}: DatePickerInputProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value ? new Date(value) : new Date());
  const { theme } = useTheme();

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

      {isIos() ? (
        <AppBottomSheet
          open={show}
          onOpenChange={setShow}
          frameProps={{ paddingHorizontal: paddingHorizontalGeneral * 2 }}
        >
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={handleSpinnerChange}
            style={{ height: 200 }}
            themeVariant={theme}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />

          <FilledButton fontWeight="600" fontSize={16} onPress={handleConfirm}>
            <Text color="$foreground">완료</Text>
          </FilledButton>
        </AppBottomSheet>
      ) : (
        show && (
          <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode="date"
            display="default"
            onChange={handleAndroidChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </>
  );
}
