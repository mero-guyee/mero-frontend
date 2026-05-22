import LocationPicker from '@/components/location/LocationPicker';
import { formatGeocode } from '@/utils/location/location';
import { MapPin } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { FootprintLocation } from '../../../../types';
import ToolbarButton from './ToolbarButton';

interface LocationButtonProps {
  onAdd: (location: FootprintLocation) => void;
}

export default function LocationButton({ onAdd }: LocationButtonProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = ({
    latitude,
    longitude,
    placeName: searchedPlaceName,
  }: {
    latitude: number;
    longitude: number;
    placeName?: string;
  }) => {
    formatGeocode(latitude, longitude).then(({ placeName: geocodedPlaceName, city, country }) => {
      onAdd({
        placeName: searchedPlaceName || geocodedPlaceName,
        country,
        city,
        latitude,
        longitude,
      });
    });
  };

  return (
    <>
      <ToolbarButton onPress={() => setOpen(true)}>
        <MapPin size={24} color="$foreground" />
      </ToolbarButton>

      <LocationPicker visible={open} onClose={() => setOpen(false)} onConfirm={handleConfirm} />
    </>
  );
}
