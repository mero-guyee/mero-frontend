import { FootprintLocation } from '@/types';

const PLACE_NAME_TYPES = ['point_of_interest', 'establishment', 'premise', 'route'];

export const formatGeocode = async (latitude: number, longitude: number) => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=ko`
  );
  const data = await res.json();
  const components: { types: string[]; long_name: string }[] =
    data.results?.[0]?.address_components ?? [];

  const get = (type: string) => components.find((c) => c.types.includes(type))?.long_name ?? '';

  const placeName = PLACE_NAME_TYPES.map(get).find(Boolean) ?? '';
  const city = get('locality') || get('sublocality_level_1') || get('administrative_area_level_1');
  const country = get('country');

  return { placeName, city, country };
};

export const formattedLocation = (loc: FootprintLocation) => {
  return [loc.placeName, loc.city, loc.country].filter(Boolean).join(', ');
};
