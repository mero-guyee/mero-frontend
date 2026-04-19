import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack } from 'tamagui';
import { filledButtonStyle } from '../button/BaseButton';

type Props = {
  currentPage: number;
  onPress: () => void;
};

export default function PageNavigator({ currentPage, onPress }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <XStack
      justifyContent="center"
      paddingVertical="$3"
      paddingTop="$2"
      paddingBottom={insets.bottom}
      backgroundColor="$background"
    >
      <XStack
        alignItems="center"
        gap="$2"
        paddingHorizontal="$4"
        paddingVertical="$2"
        onPress={onPress}
        {...filledButtonStyle}
      >
        {currentPage === 0 ? (
          <>
            <Text color="$foreground">이야기 마저 쓰기</Text>
            <ChevronDown size={14} color="$mutedForeground" />
          </>
        ) : (
          <>
            <Text color="$foreground">기록 정보로 돌아가기</Text>
            <ChevronUp size={14} color="$mutedForeground" />
          </>
        )}
      </XStack>
    </XStack>
  );
}
