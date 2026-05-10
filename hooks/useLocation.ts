import retryAsync from '@/utils/retryAsync';
import * as Location from 'expo-location';

interface RetryOptions {
  retries?: number;
  delayMs?: number;
  timeoutMs?: number;
}

export default function useLocation() {
  const [locationPermissionsInfo] = Location.useForegroundPermissions();

  async function getCurrentPositionWithRetry(
    options?: Location.LocationOptions,
    retryOptions: RetryOptions = {}
  ): Promise<Location.LocationObject> {
    const { retries = 5, delayMs = 200, timeoutMs } = retryOptions;

    return retryAsync(() => Location.getCurrentPositionAsync(options), {
      retries,
      delayMs,
      timeoutMs,
    });
  }

  async function getLastKnownPositionWithRetry(
    options?: Location.LocationLastKnownOptions,
    retryOptions: RetryOptions = {}
  ): Promise<Location.LocationObject | null> {
    const { retries = 1, delayMs = 100, timeoutMs } = retryOptions;

    return retryAsync(() => Location.getLastKnownPositionAsync(options), {
      retries,
      delayMs,
      timeoutMs,
    });
  }

  return {
    status: locationPermissionsInfo ? locationPermissionsInfo.status : null,
    getCurrentPositionWithRetry,
    getLastKnownPositionWithRetry,
  };
}
