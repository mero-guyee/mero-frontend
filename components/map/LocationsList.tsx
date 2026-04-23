import { YCard } from '@/components/ui/Card';
import { Footprint } from '@/types';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

interface LocationsListProps {
  footprintsByCountry: Record<string, Footprint[]>;
  onCountryClick: (country: string) => void;
  onLocationClick: (country: string, location: string) => void;
}

export default function LocationsList({
  footprintsByCountry,
  onCountryClick,
  onLocationClick,
}: LocationsListProps) {
  const hasFootprints = Object.keys(footprintsByCountry).length > 0;

  if (!hasFootprints) {
    return (
      <YStack alignItems="center" justifyContent="center" paddingVertical={80}>
        <Text fontSize={48} marginBottom="$4">
          🌍
        </Text>
        <Text color="$foreground" marginBottom="$1">
          아직 여행 기록이 없습니다
        </Text>
        <Text color="$mutedForeground">새로운 여행을 떠나보세요</Text>
      </YStack>
    );
  }

  return (
    <YStack>
      <Text color="$foreground" fontSize={16} fontWeight="600" marginBottom="$3">
        거쳐간 땅
      </Text>
      <YStack gap="$3">
        {Object.entries(footprintsByCountry).map(([country, countryMemos]) => (
          <YCard key={country} padding="$4">
            <Pressable onPress={() => onCountryClick(country)}>
              <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
                <Text color="$foreground" fontSize={16} fontWeight="500">
                  {country}
                </Text>
                <Text color="$mutedForeground" fontSize={14}>
                  {countryMemos.length}개 기록
                </Text>
              </XStack>
            </Pressable>
            <YStack gap="$1">
              {countryMemos.slice(0, 3).map((memo) => {
                const placeName = memo.locations.find((l) => l.country === country)?.placeName;
                return (
                  <Pressable
                    key={memo.id}
                    onPress={() => placeName && onLocationClick(country, placeName)}
                  >
                    <Text color="$mutedForeground" paddingVertical="$1">
                      • {placeName || memo.title}
                    </Text>
                  </Pressable>
                );
              })}
              {countryMemos.length > 3 && (
                <Text color="$mutedForeground">외 {countryMemos.length - 3}개 장소</Text>
              )}
            </YStack>
          </YCard>
        ))}
      </YStack>
    </YStack>
  );
}
