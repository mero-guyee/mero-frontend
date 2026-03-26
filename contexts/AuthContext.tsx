import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authApi, tokenStorage } from '../api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean; // 앱 시작 시 토큰 복원 중 여부
  setIsAuthenticated: (value: boolean) => void;
  login: ({ email, password }: { email: string; password: string }) => Promise<void>;
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

  const logout = async () => {
    await authApi.logout();
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    setIsAuthenticated,
    login,
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
