import { Calendar, MapPin } from '@tamagui/lucide-icons';
import { Text, XStack } from 'tamagui';
import { FootprintLocation } from '../../../../types';

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${month}월 ${day}일 (${days[d.getDay()]})`;
}

type Props = {
  date: string;
  locations: FootprintLocation[];
  weatherInfo: string;
};

export default function MetadataChips({ date, locations, weatherInfo }: Props) {
  return (
    <XStack flexWrap="wrap" gap="$2" marginBottom="$5">
      <XStack
        alignItems="center"
        gap="$1"
        paddingHorizontal="$3"
        paddingVertical="$2"
        backgroundColor="$accent"
        borderRadius={8}
      >
        <Calendar size={12} color="$mutedForeground" />
        <Text fontSize={13} color="$foreground">
          {formatDate(date)}
        </Text>
      </XStack>
      {locations.map((loc, index) => (
        <XStack
          key={index}
          alignItems="center"
          gap="$1"
          paddingHorizontal="$3"
          paddingVertical="$2"
          backgroundColor="$accent"
          borderRadius={8}
        >
          <MapPin size={12} color="$mutedForeground" />
          <Text fontSize={13} color="$foreground">
            {loc.placeName}
          </Text>
        </XStack>
      ))}
      {weatherInfo ? (
        <XStack
          alignItems="center"
          paddingHorizontal="$3"
          paddingVertical="$2"
          backgroundColor="$accent"
          borderRadius={8}
        >
          <Text fontSize={13} color="$foreground">
            {weatherInfo}
          </Text>
        </XStack>
      ) : null}
    </XStack>
  );
}
