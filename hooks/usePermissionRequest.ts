import { useAppModal } from '@/contexts';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

export function usePermissionRequest() {
  const { showConfirm } = useAppModal();

  return async function requestPermission(
    requestFn: () => Promise<ImagePicker.PermissionResponse>,
    deniedMessage: string,
    closeSheet?: () => void
  ): Promise<boolean> {
    const permission = await requestFn();
    if (permission.granted) return true;

    if (!permission.canAskAgain) {
      closeSheet?.();
      if (closeSheet) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      const goToSettings = await showConfirm('권한 필요', deniedMessage, {
        confirmText: '설정으로 이동',
      });
      if (goToSettings) {
        Linking.openSettings();
      }
    }

    return false;
  };
}
