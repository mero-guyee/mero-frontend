import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'mero_access_token';
const REFRESH_KEY = 'mero_refresh_token';

export const tokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_KEY),
  setTokens: async (accessToken: string, refreshToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
  },
  clearTokens: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};
