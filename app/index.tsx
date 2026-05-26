import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, YStack } from 'tamagui';
import { useAuth } from '../contexts';

export default function LoadingScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? '/(main)/trips' : '/(auth)/login');
    }, 500);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, router]);

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center"
      padding="$6"
    >
      <Image source={require('@/assets/icon.png')} width={80} height={80} />
    </YStack>
  );
}
