import { useTrips } from '@/contexts';
import { Trip } from '@/types';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import MoreEditDelete from '../ui/MoreEditDelete';
import BackActionHeader from '../ui/header/BackActionHeader';

export default function BackpackHeader({ trip }: { trip: Trip }) {
  const { deleteTrip } = useTrips();

  const handleBack = () => {
    router.navigate('/(main)/trips');
  };

  const handleEdit = () => {
    router.navigate(`/backpack/edit`);
  };

  const handleDelete = () => {
    Alert.alert(
      '여행 삭제',
      '이 여행과 관련된 모든 일기와 경비가 삭제됩니다. 정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteTrip(trip.id || '');
            router.replace('/trips');
          },
        },
      ]
    );
  };

  return (
    <BackActionHeader label={trip.title} onBack={handleBack}>
      <MoreEditDelete onEdit={handleEdit} onDelete={handleDelete} />
    </BackActionHeader>
  );
}
