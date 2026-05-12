import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Platform } from 'react-native';
import ToolbarButton from './ToolbarButton';

interface DateButtonProps {
  value: string;
  onChange: (date: string) => void;
}

export default function DateButton({ value, onChange }: DateButtonProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (_event: any, selectedDate?: Date) => {
    setOpen(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <>
      <ToolbarButton onPress={() => setOpen(true)}>
        <Calendar size={24} color="$foreground" />
      </ToolbarButton>
      {open && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="default"
          accentColor="#C8DEE6"
          onChange={handleChange}
        />
      )}
    </>
  );
}
