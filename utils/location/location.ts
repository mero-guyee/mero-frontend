import { FootprintLocation } from '@/types';
import * as ExpoLocation from 'expo-location';

export const formatGeocode = async (latitude: number, longitude: number) => {
  const result = await ExpoLocation.reverseGeocodeAsync({ latitude, longitude });
  const { name, city, country } = result[0];
  return {
    placeName: name || '',
    city: city || '',
    country: country || '',
  };
};

export const formattedLocation = (loc: FootprintLocation) => {
  return [loc.placeName, loc.city, loc.country].filter(Boolean).join(', ');
};
