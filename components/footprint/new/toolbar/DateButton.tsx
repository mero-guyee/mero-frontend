import DatePickerInput from '@/components/ui/DatePickerInput';
import { Calendar } from '@tamagui/lucide-icons';
import ToolbarButton from './ToolbarButton';

interface DateButtonProps {
  value: string;
  onChange: (date: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function DateButton({ value, onChange, minimumDate, maximumDate }: DateButtonProps) {
  return (
    <DatePickerInput
      value={value}
      onChange={onChange}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      renderTrigger={(onPress) => (
        <ToolbarButton onPress={onPress}>
          <Calendar size={24} color="$foreground" />
        </ToolbarButton>
      )}
    />
  );
}
