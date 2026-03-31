import { CircularButton } from '@/components/ui';
import { useTrips } from '@/contexts';
import { Trip } from '@/types';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack } from 'tamagui';
import More from '../ui/More';

export default function BackpackHeader({ trip }: { trip: Trip }) {
  const { deleteTrip } = useTrips();

  const insets = useSafeAreaInsets();

  const handleBack = () => {
    router.navigate('/(main)/trips');
  };

  const handleEdit = () => {
    router.push(`/trips/${trip.id}/edit`);
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
    <XStack
      backgroundColor="$card"
      paddingTop={insets.top}
      paddingHorizontal="$4"
      paddingBottom="$3"
      alignItems="center"
      justifyContent="space-between"
      borderBottomWidth={2}
      borderBottomColor="$primary"
      style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
    >
      <CircularButton onPress={handleBack}>
        <ArrowLeft size={20} color="$foreground" />
      </CircularButton>
      <Text flex={1} textAlign="center" color="$foreground" fontSize={16} fontWeight="500">
        {trip.title}
      </Text>
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
    </XStack>
  );
}
