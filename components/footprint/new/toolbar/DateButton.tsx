import DatePickerInput from '@/components/ui/DatePickerInput';
import { Calendar } from '@tamagui/lucide-icons';
import ToolbarButton from './ToolbarButton';

interface DateButtonProps {
  value: string;
  onChange: (date: string) => void;
}

export default function DateButton({ value, onChange }: DateButtonProps) {
  return (
    <DatePickerInput
      value={value}
      onChange={onChange}
      renderTrigger={(onPress) => (
        <ToolbarButton onPress={onPress}>
          <Calendar size={24} color="$foreground" />
        </ToolbarButton>
      )}
    />
  );
}
