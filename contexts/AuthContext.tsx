import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authApi, tokenStorage } from '../api';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  login: ({ email, password }: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 앱 시작 시 SecureStore에서 토큰을 읽어 로그인 상태 복원
  useEffect(() => {
    tokenStorage
      .getAccessToken()
      .then((token) => {
        if (token) setIsAuthenticated(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    await authApi.login({ email, password });
    setIsAuthenticated(true);
    router.push('/(main)/trips');
  };

  const loginWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) throw new Error('Google 로그인이 취소되었습니다.');
      const { idToken } = response.data;

      if (!idToken) throw new Error('Google idToken을 가져올 수 없습니다.');
      await authApi.googleLogin(idToken);
      setIsAuthenticated(true);
      router.push('/(main)/trips');
    } catch (e: any) {
      console.error('Google 로그인 실패:', e);
      throw new Error(e?.message ?? 'Google 로그인 과정에서 오류가 발생했습니다.');
    }
  };

  const logout = async () => {
    await authApi.logout();
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    setIsAuthenticated,
    login,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
