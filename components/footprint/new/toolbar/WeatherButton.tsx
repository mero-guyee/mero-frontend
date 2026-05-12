import { Cloud } from '@tamagui/lucide-icons';
import { useState } from 'react';
import WeatherSheet from '../WeatherSheet';
import ToolbarButton from './ToolbarButton';

interface WeatherButtonProps {
  value: string;
  onChange: (weatherInfo: string) => void;
}

export default function WeatherButton({ value, onChange }: WeatherButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ToolbarButton onPress={() => setOpen(true)}>
        <Cloud size={24} color="$foreground" />
      </ToolbarButton>
      <WeatherSheet
        open={open}
        onOpenChange={setOpen}
        initialWeatherInfo={value}
        onConfirm={onChange}
      />
    </>
  );
}
