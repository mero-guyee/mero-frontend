import { Trip } from '@/types';
import { Home } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { IconButton } from '../ui/button/BaseButton';
import TabScreenHeader from '../ui/header/TabScreenHeader';

export default function BackpackHeader({ trip }: { trip: Trip }) {
  const handleBack = () => {
    router.navigate('/(main)/trips');
  };

  return (
    <TabScreenHeader label={trip.title}>
      <IconButton onPress={handleBack}>
        <Home size={22} color="$foreground" />
      </IconButton>
    </TabScreenHeader>
  );
}
