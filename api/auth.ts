import { apiRequest, tokenStorage } from './client';

export type Currency =
  | 'KRW'
  | 'USD'
  | 'EUR'
  | 'JPY'
  | 'GBP'
  | 'CNY'
  | 'CHF'
  | 'CAD'
  | 'AUD'
  | 'PEN'
  | 'BOB'
  | 'CLP'
  | 'ARS'
  | 'BRL'
  | 'COP'
  | 'UYU'
  | 'PYG'
  | 'VES'
  | 'GYD'
  | 'SRD'
  | 'TWD'
  | 'HKD'
  | 'SGD'
  | 'THB'
  | 'VND'
  | 'PHP'
  | 'MYR'
  | 'IDR'
  | 'AED'
  | 'SAR'
  | 'ZAR'
  | 'EGP'
  | 'SEK'
  | 'NOK'
  | 'DKK'
  | 'PLN'
  | 'CZK'
  | 'HUF'
  | 'RUB'
  | 'NZD'
  | 'MXN'
  | 'INR';

export type Timezone =
  | 'ASIA_SEOUL'
  | 'ASIA_TOKYO'
  | 'ASIA_SHANGHAI'
  | 'ASIA_HONG_KONG'
  | 'ASIA_TAIPEI'
  | 'ASIA_SINGAPORE'
  | 'ASIA_BANGKOK'
  | 'ASIA_HO_CHI_MINH'
  | 'ASIA_JAKARTA'
  | 'ASIA_MANILA'
  | 'ASIA_KUALA_LUMPUR'
  | 'ASIA_KOLKATA'
  | 'ASIA_DHAKA'
  | 'ASIA_KARACHI'
  | 'ASIA_DUBAI'
  | 'ASIA_RIYADH'
  | 'ASIA_JERUSALEM'
  | 'ASIA_ISTANBUL'
  | 'AMERICA_LIMA'
  | 'AMERICA_BOGOTA'
  | 'AMERICA_GUAYAQUIL'
  | 'AMERICA_LA_PAZ'
  | 'AMERICA_SANTIAGO'
  | 'AMERICA_ASUNCION'
  | 'AMERICA_CARACAS'
  | 'AMERICA_BUENOS_AIRES'
  | 'AMERICA_SAO_PAULO'
  | 'AMERICA_MONTEVIDEO'
  | 'AMERICA_NEW_YORK'
  | 'AMERICA_CHICAGO'
  | 'AMERICA_DENVER'
  | 'AMERICA_LOS_ANGELES'
  | 'AMERICA_ANCHORAGE'
  | 'AMERICA_HONOLULU'
  | 'AMERICA_TORONTO'
  | 'AMERICA_VANCOUVER'
  | 'AMERICA_MEXICO_CITY'
  | 'EUROPE_LONDON'
  | 'EUROPE_PARIS'
  | 'EUROPE_BERLIN'
  | 'EUROPE_ROME'
  | 'EUROPE_MADRID'
  | 'EUROPE_AMSTERDAM'
  | 'EUROPE_BRUSSELS'
  | 'EUROPE_ZURICH'
  | 'EUROPE_VIENNA'
  | 'EUROPE_STOCKHOLM'
  | 'EUROPE_OSLO'
  | 'EUROPE_COPENHAGEN'
  | 'EUROPE_WARSAW'
  | 'EUROPE_PRAGUE'
  | 'EUROPE_BUDAPEST'
  | 'EUROPE_MOSCOW'
  | 'EUROPE_ATHENS'
  | 'AUSTRALIA_SYDNEY'
  | 'AUSTRALIA_MELBOURNE'
  | 'AUSTRALIA_PERTH'
  | 'PACIFIC_AUCKLAND'
  | 'AFRICA_CAIRO'
  | 'AFRICA_JOHANNESBURG'
  | 'AFRICA_LAGOS'
  | 'AFRICA_NAIROBI'
  | 'UTC';

export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  defaultCurrency?: Currency;
  timezone?: Timezone;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  nickname: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: number;
  email: string;
  nickname: string;
  profileImage?: string;
  defaultCurrency?: Currency;
  timezone?: Timezone;
  createdAt: string;
}

export const authApi = {
  signup: (data: SignUpRequest): Promise<UserResponse> =>
    apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await tokenStorage.setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  logout: async (): Promise<void> => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    await tokenStorage.clearTokens();
  },
};
