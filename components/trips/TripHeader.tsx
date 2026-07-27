import { paddingHorizontalGeneral } from '@/constants/theme';
import { useUserQuery } from '@/hooks/queries/useUser';
import { Settings } from '@tamagui/lucide-icons';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { CircularButton } from '../ui';

const DEFAULT_AVATAR = Asset.fromModule(require('@/assets/images/default-avatar.png')).uri;

interface TripHeaderProps {
  onSettings: () => void;
}

export function TripHeader({ onSettings }: TripHeaderProps) {
  const { data: user } = useUserQuery();

  const [localUri, setLocalUri] = useState(user?.profileImage ?? DEFAULT_AVATAR);

  useEffect(() => {
    setLocalUri(user?.profileImage ?? DEFAULT_AVATAR);
  }, [user?.profileImage]);

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
            <Image
              source={{ uri: localUri }}
              contentFit="cover"
              cachePolicy="memory-disk"
              style={{ width: 48, height: 48 }}
              onError={() => setLocalUri(DEFAULT_AVATAR)}
            />
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
