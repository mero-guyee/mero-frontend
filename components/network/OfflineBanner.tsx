import { useIsOffline } from '@/hooks/network/useIsOffline';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OfflineBanner() {
  const isOffline = useIsOffline();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isOffline) {
      Toast.show({
        type: 'offline',
        position: 'bottom',
        bottomOffset: insets.bottom + 72,
        autoHide: false,
        swipeable: false,
      });
    } else {
      Toast.hide();
    }
  }, [isOffline, insets.bottom]);

  return null;
}
