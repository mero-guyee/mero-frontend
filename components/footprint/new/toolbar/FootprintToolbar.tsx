import { XStack } from 'tamagui';
import { FootprintLocation } from '../../../../types';
import DateButton from './DateButton';
import LocationButton from './LocationButton';
import PhotoButton from './PhotoButton';
import WeatherButton from './WeatherButton';

interface FootprintToolbarProps {
  date: string;
  onDateChange: (date: string) => void;
  dateMin?: Date;
  dateMax?: Date;
  weatherInfo: string;
  onWeatherChange: (weatherInfo: string) => void;
  onLocationAdd: (location: FootprintLocation) => void;
  onPhotoAdd: (uris: string[]) => void;
}

export default function FootprintToolbar({
  date,
  onDateChange,
  dateMin,
  dateMax,
  weatherInfo,
  onWeatherChange,
  onLocationAdd,
  onPhotoAdd,
}: FootprintToolbarProps) {
  return (
    <XStack flexWrap="wrap" paddingHorizontal="$3">
      <DateButton value={date} onChange={onDateChange} minimumDate={dateMin} maximumDate={dateMax} />
      <LocationButton onAdd={onLocationAdd} />
      <WeatherButton value={weatherInfo} onChange={onWeatherChange} />
      <PhotoButton onAdd={onPhotoAdd} />
    </XStack>
  );
}
