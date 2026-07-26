import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authApi, setAuthExpiredHandler, tokenStorage, userApi } from '../api';
import { useDb } from '../providers/DatabaseProvider';
import { UserRepository } from '../repositories';

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
  loginWithApple: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const db = useDb();

  const cacheCurrentUser = async () => {
    try {
      const user = await userApi.getMe();
      await new UserRepository(db).upsertFromServer(user);
    } catch (e) {
      console.error('Failed to cache user:', e);
    }
  };

  useEffect(() => {
    tokenStorage
      .getAccessToken()
      .then((token) => {
        if (token) setIsAuthenticated(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setAuthExpiredHandler(() => setIsAuthenticated(false));
    return () => setAuthExpiredHandler(null);
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    const res = await authApi.login({ email, password });
    setIsAuthenticated(true);
    await cacheCurrentUser();
    router.push(res.isNewUser ? '/onboarding' : '/(main)/trips');
  };

  const loginWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) throw new Error('Google 로그인이 취소되었습니다.');
      const { idToken } = response.data;

      if (!idToken) throw new Error('Google idToken을 가져올 수 없습니다.');
      const res = await authApi.googleLogin(idToken);
      setIsAuthenticated(true);
      await cacheCurrentUser();
      router.push(res.isNewUser ? '/onboarding' : '/(main)/trips');
    } catch (e: any) {
      console.error('Google 로그인 실패:', e);
      throw new Error(e?.message ?? 'Google 로그인 과정에서 오류가 발생했습니다.');
    }
  };

  const loginWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) throw new Error('Apple identityToken을 가져올 수 없습니다.');
      const res = await authApi.appleLogin(credential.identityToken);
      setIsAuthenticated(true);
      await cacheCurrentUser();
      router.push(res.isNewUser ? '/onboarding' : '/(main)/trips');
    } catch (e: any) {
      if (e?.code === 'ERR_REQUEST_CANCELED') {
        throw new Error('Apple 로그인이 취소되었습니다.');
      }
      console.error('Apple 로그인 실패:', e);
      throw new Error(e?.message ?? 'Apple 로그인 과정에서 오류가 발생했습니다.');
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    await authApi.logout();
    await new UserRepository(db).clear();
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    setIsAuthenticated,
    login,
    loginWithGoogle,
    loginWithApple,
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
