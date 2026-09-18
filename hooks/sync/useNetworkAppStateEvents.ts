import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { debugLog } from '../../utils/debugLog';

const PERIODIC_INTERVAL_MS = 60000;
const PERIODIC_MAX_AGE_MINUTES = 7;

export function useNetworkAppStateEvents(onTrigger: (maxAgeMinutes?: number) => void) {
  const prevReachable = useRef<boolean | null>(false);

  useEffect(() => {
    const checkConnection = (isReachable: boolean): boolean => {
      const isReconnected = isReachable && prevReachable.current === false;
      prevReachable.current = isReachable;
      return isReconnected;
    };

    const handleChangeNetworkConnection = (state: NetInfoState) => {
      debugLog(
        `[netevents] netinfo change isConnected=${state.isConnected} isInternetReachable=${state.isInternetReachable} type=${state.type}`
      );
      if (checkConnection(state.isInternetReachable ?? state.isConnected ?? false)) {
        debugLog('[netevents] reconnect edge detected -> onTrigger() (immediate)');
        onTrigger();
      }
    };

    const handleChangeAppState = (next: AppStateStatus) => {
      debugLog(`[netevents] appstate change -> ${next}`);
      if (next === 'active') {
        debugLog('[netevents] app active -> onTrigger() (immediate)');
        onTrigger();
      }
    };

    const pollConnection = async () => {
      const { isConnected, isInternetReachable } = await NetInfo.fetch();
      if (checkConnection(isInternetReachable ?? isConnected ?? false)) {
        debugLog('[netevents] poll: reconnect edge detected -> onTrigger() (immediate)');
        onTrigger();
      }
      debugLog('[netevents] poll -> onTrigger(periodic)');
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
