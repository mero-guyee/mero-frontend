import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, router]);
}
