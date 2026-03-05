import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 오프라인에서도 캐시된 데이터를 사용하기 위해 staleTime을 길게 설정
      staleTime: 1000 * 60 * 5, // 5분
      // 네트워크 재연결 시 자동으로 refetch
      refetchOnReconnect: true,
      // 오프라인 환경을 위해 실패 시 재시도 최소화
      retry: 1,
      // 네트워크 없어도 캐시 데이터 반환
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 0,
    },
  },
});

export { queryClient };

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
