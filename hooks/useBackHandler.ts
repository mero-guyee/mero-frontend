import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useRef } from 'react';
import { BackHandler } from 'react-native';
import Toast from 'react-native-toast-message';

export default function useBackHandler() {
  const path = usePathname();
  const backPressedOnce = useRef(false);

  const backPressConditions = {
    nestedPath: path.split('/').length > 2,
    onTripsMain: path === '/trips',
  };

  const checkBackpressToExitApp = () => {
    if (backPressedOnce.current) {
      BackHandler.exitApp();
      return true;
    }

    backPressedOnce.current = true;
    Toast.show({
      type: 'handleBackPress',
      text1: '앱을 종료하시겠습니까?',
      text2: '뒤로가기를 한 번 더 누르면 종료됩니다.',
      position: 'bottom',
      visibilityTime: 2000,
    });

    setTimeout(() => {
      backPressedOnce.current = false;
    }, 2000);
  };
  useFocusEffect(
    useCallback(() => {
      if (backPressConditions.onTripsMain) {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
          checkBackpressToExitApp();
          return true;
        });
        return () => sub.remove();
      } else {
        if (backPressConditions.nestedPath) {
          return;
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
          router.navigate('/(main)/trips');
          return true;
        });

        return () => backHandler.remove();
      }
    }, [path, backPressConditions.nestedPath, backPressConditions.onTripsMain])
  );
}
