import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Spinner } from 'tamagui';
import { Image } from 'expo-image';
import { useAuth } from '../contexts';

// 원본 LoadingScreen.tsx 변환
export default function LoadingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 로딩 애니메이션 시뮬레이션
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // 로딩 완료 후 로그인 또는 메인 화면으로 이동
          setTimeout(() => {
            if (isAuthenticated) {
              router.replace('/(main)/trips');
            } else {
              router.replace('/(auth)/login');
            }
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center"
      padding="$6"
    >
      {/* 로고/일러스트 영역 */}
      <YStack
        width={200}
        height={200}
        backgroundColor="$accent"
        borderRadius={100}
        alignItems="center"
        justifyContent="center"
        marginBottom="$8"
        style={{
          shadowColor: '#5C4033',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Text fontSize={80}>🎒</Text>
      </YStack>

      {/* 앱 이름 */}
      <Text
        fontSize={28}
        fontWeight="700"
        color="$foreground"
        marginBottom="$2"
        style={{ fontFamily: 'System' }}
      >
        유랑
      </Text>
      <Text
        fontSize={16}
        color="$mutedForeground"
        marginBottom="$8"
        textAlign="center"
      >
        여행의 모든 순간을 기록하세요
      </Text>

      {/* 로딩 인디케이터 */}
      <YStack width="60%" marginTop="$4">
        <YStack
          height={6}
          backgroundColor="$muted"
          borderRadius={3}
          overflow="hidden"
        >
          <YStack
            height={6}
            backgroundColor="$primary"
            borderRadius={3}
            width={`${progress}%`}
          />
        </YStack>
        <Text
          fontSize={12}
          color="$mutedForeground"
          textAlign="center"
          marginTop="$2"
        >
          로딩 중...
        </Text>
      </YStack>
    </YStack>
  );
}
