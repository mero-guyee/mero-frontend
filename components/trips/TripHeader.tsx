import { paddingHorizontalGeneral } from '@/constants/theme';
import { useUserQuery } from '@/hooks/queries/useUser';
import { Settings, User } from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { CircularButton } from '../ui';

interface TripHeaderProps {
  onSettings: () => void;
}

export function TripHeader({ onSettings }: TripHeaderProps) {
  const { data: user } = useUserQuery();

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [user?.profileImage]);

  const showProfileImage = !!user?.profileImage && !imageError;

  return (
    <YStack backgroundColor="$background" padding={paddingHorizontalGeneral}>
      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap="$3">
          <YStack
            width={48}
            height={48}
            backgroundColor="$accent"
            borderRadius={24}
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            {showProfileImage ? (
              <Image
                source={{ uri: user.profileImage! }}
                contentFit="cover"
                cachePolicy="memory-disk"
                style={{ width: 48, height: 48 }}
                onError={() => setImageError(true)}
              />
            ) : (
              <User size={24} color="$foreground" />
            )}
          </YStack>
          <YStack>
            <Text fontSize={18} fontWeight="600" color="$foreground">
              {user?.nickname ?? ''}님의 기록
            </Text>
            <Text fontSize={14} color="$mutedForeground">
              세계는 넓고 갈 곳은 많습니다
            </Text>
          </YStack>
        </XStack>

        <CircularButton
          mr="$1"
          pressStyle={{ backgroundColor: '$muted' }}
          onPress={onSettings}
          testID="settings-button"
        >
          <Settings size="$7" color="$foreground" />
        </CircularButton>
      </XStack>
    </YStack>
  );
}
