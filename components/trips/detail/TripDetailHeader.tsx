import { CircularButton } from '@/components/ui';
import { useTrips } from '@/contexts';
import { Trip } from '@/types';
import { ArrowLeft, MoreVertical } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';

export default function TripDetailHeader({ trip }: { trip: Trip }) {
  const [showMenu, setShowMenu] = useState(false);
  const { deleteTrip } = useTrips();

  const insets = useSafeAreaInsets();

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    setShowMenu(false);
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
      <YStack position="relative">
        <CircularButton onPress={() => setShowMenu(!showMenu)}>
          <MoreVertical size={20} color="$foreground" />
        </CircularButton>
        {showMenu && (
          <YStack
            position="absolute"
            top={44}
            right={0}
            width={180}
            backgroundColor="$card"
            borderRadius="$4"
            overflow="hidden"
            zIndex={100}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Pressable onPress={handleEdit}>
              <XStack padding="$3" hoverStyle={{ backgroundColor: '$accent' }}>
                <Text color="$foreground">수정</Text>
              </XStack>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowMenu(false);
                handleDelete();
              }}
            >
              <XStack padding="$3" hoverStyle={{ backgroundColor: '$destructive' }}>
                <Text color="$destructive">삭제</Text>
              </XStack>
            </Pressable>
          </YStack>
        )}
      </YStack>
    </XStack>
  );
}
