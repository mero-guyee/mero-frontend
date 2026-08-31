import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

const PERIODIC_INTERVAL_MS = 60000;
const PERIODIC_MAX_AGE_MINUTES = 7;

export function useNetworkAppStateEvents(onTrigger: (maxAgeMinutes?: number) => void) {
  const prevConnected = useRef<boolean | null>(false);

  useEffect(() => {
    const checkConnection = (isConnected: boolean): boolean => {
      const isReconnected = isConnected && prevConnected.current === false;
      prevConnected.current = isConnected;
      return isReconnected;
    };

    const handleChangeNetworkConnection = (state: NetInfoState) => {
      if (checkConnection(state.isConnected ?? false)) {
        onTrigger();
      }
    };

    const handleChangeAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        onTrigger();
      }
    };

    const pollConnection = async () => {
      const { isConnected } = await NetInfo.fetch();
      if (checkConnection(isConnected ?? false)) {
        onTrigger();
      }
      onTrigger(PERIODIC_MAX_AGE_MINUTES);
    };

    const unsubNetInfo = NetInfo.addEventListener(handleChangeNetworkConnection);
    const subAppState = AppState.addEventListener('change', handleChangeAppState);
    const polling = setInterval(pollConnection, PERIODIC_INTERVAL_MS);

    return () => {
      unsubNetInfo();
      subAppState.remove();
      clearInterval(polling);
    };
  }, [onTrigger]);
}
