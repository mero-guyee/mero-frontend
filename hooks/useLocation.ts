import * as Location from 'expo-location';

interface RetryOptions {
  retries?: number;
  delayMs?: number;
}

export default function useLocation() {
  const [locationPermissionsInfo] = Location.useForegroundPermissions();

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  async function getCurrentPositionWithRetry(
    options?: Location.LocationOptions,
    retryOptions: RetryOptions = {}
  ): Promise<Location.LocationObject> {
    const { retries = 5, delayMs = 1000 } = retryOptions;

    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await Location.getCurrentPositionAsync(options);
      } catch (error) {
        lastError = error;

        if (attempt < retries) {
          await sleep(delayMs);
        }
      }
    }

    throw lastError;
  }

  return {
    status: locationPermissionsInfo ? locationPermissionsInfo.status : null,
    getCurrentPositionWithRetry,
  };
}
