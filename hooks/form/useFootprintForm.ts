import { useFootprints, useTrips } from '@/contexts';
import { FootprintLocation } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useFootprintForm() {
  const { footprintId } = useLocalSearchParams<{ footprintId?: string }>();
  const router = useRouter();
  const { trips, activeTrip } = useTrips();
  const { footprints, addFootprint, updateFootprint } = useFootprints();

  const existingFootprint = footprintId ? footprints.find((f) => f.id === footprintId) : undefined;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [tripId, setTripId] = useState(activeTrip || trips[0]?.id || '');
  const [weatherInfo, setWeatherInfo] = useState('');
  const [locations, setLocations] = useState<FootprintLocation[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    if (existingFootprint) {
      setTitle(existingFootprint.title);
      setDate(existingFootprint.date);
      setContent(existingFootprint.content);
      setTripId(existingFootprint.tripId);
      setWeatherInfo(existingFootprint.weatherInfo || '');
      setLocations(existingFootprint.locations);
      setPhotoUrls(existingFootprint.photoUrls ?? []);
    }
  }, [existingFootprint]);

  const handleAddPhotos = (uris: string[]) => {
    setPhotoUrls((prev) => [...prev, ...uris]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim() || !tripId) {
      Alert.alert('오류', '제목과 여행을 선택해주세요.');
      return;
    }

    const footprintData = {
      tripId,
      title: title.trim(),
      date,
      content: content.trim(),
      locations,
      photoUrls,
      weatherInfo: weatherInfo.trim() || undefined,
    };

    if (existingFootprint) {
      updateFootprint({ ...existingFootprint, ...footprintData });
    } else {
      addFootprint(footprintData);
    }

    router.back();
  };

  return {
    existingFootprint,
    title,
    setTitle,
    date,
    setDate,
    content,
    setContent,
    tripId,
    setTripId,
    weatherInfo,
    setWeatherInfo,
    locations,
    setLocations,
    photoUrls,
    handleAddPhotos,
    handleRemovePhoto,
    handleSubmit,
  };
}
