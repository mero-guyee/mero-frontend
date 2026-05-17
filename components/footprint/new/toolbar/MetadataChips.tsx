import Chip from '@/components/ui/Chip';
import { Calendar, MapPin } from '@tamagui/lucide-icons';
import { XStack } from 'tamagui';
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
      <Chip label={formatDate(date)} icon={<Calendar size={12} color="$mutedForeground" />} />
      {locations.map((loc, index) => (
        <Chip
          key={index}
          label={loc.placeName ?? ''}
          icon={<MapPin size={12} color="$mutedForeground" />}
        />
      ))}
      {weatherInfo ? <Chip label={weatherInfo} /> : null}
    </XStack>
  );
}
