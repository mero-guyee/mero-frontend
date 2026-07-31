import { useAppModal, useTrips } from '@/contexts';
import { Trip } from '@/types';
import { Home } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import MoreEditDelete from '../ui/MoreEditDelete';
import BackActionHeader from '../ui/header/BackActionHeader';

export default function BackpackHeader({ trip }: { trip: Trip }) {
  const { deleteTrip } = useTrips();
  const { showConfirm } = useAppModal();

  const handleBack = () => {
    router.navigate('/(main)/trips');
  };

  const handleEdit = () => {
    router.navigate(`/backpack/edit`);
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm(
      '여행 삭제',
      '이 여행과 관련된 모든 일기와 경비가 삭제됩니다. 정말 삭제하시겠습니까?',
      { confirmText: '삭제', destructive: true }
    );
    if (!confirmed) return;
    try {
      await deleteTrip(trip.id || '');
      router.replace('/(main)/trips');
    } catch {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '여행을 삭제하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
  };

  return (
    <BackActionHeader
      label={trip.title}
      onBack={handleBack}
      icon={<Home size="6.5" color="$foreground" />}
    >
      <MoreEditDelete onEdit={handleEdit} onDelete={handleDelete} />
    </BackActionHeader>
  );
}
