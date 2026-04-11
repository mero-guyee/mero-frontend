import { useTrips } from '@/contexts';
import { Trip } from '@/types';
import { router } from 'expo-router';
import { Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack } from 'tamagui';
import More from '../ui/More';
import BackActionHeader from '../ui/header/BackActionHeader';

export default function BackpackHeader({ trip }: { trip: Trip }) {
  const { deleteTrip } = useTrips();

  const insets = useSafeAreaInsets();

  const handleBack = () => {
    router.navigate('/(main)/trips');
  };

  const handleEdit = () => {
    router.navigate(`/trips/${trip.id}/edit`);
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
      <More>
        <Pressable onPress={handleEdit}>
          <XStack padding="$3" hoverStyle={{ backgroundColor: '$accent' }}>
            <Text color="$foreground">수정</Text>
          </XStack>
        </Pressable>
        <Pressable
          onPress={() => {
            handleDelete();
          }}
        >
          <XStack padding="$3" hoverStyle={{ backgroundColor: '$destructive' }}>
            <Text color="$destructive">삭제</Text>
          </XStack>
        </Pressable>
      </More>
    </BackActionHeader>
  );
}
