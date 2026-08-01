import { Trip } from '@/types';
import TabScreenHeader from '../ui/header/TabScreenHeader';

export default function BackpackHeader({ trip }: { trip: Trip }) {
  return <TabScreenHeader label={trip.title} />;
}
