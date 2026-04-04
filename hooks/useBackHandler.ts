import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';

export default function useBackHandler() {
  const currentPath = usePathname();

  useFocusEffect(
    useCallback(() => {
      if (currentPath !== '/trips') {
        const onBackPress = () => {
          router.push('/(main)/trips');
          return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => backHandler.remove();
      } else {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
          Alert.alert('앱 종료', '앱을 종료하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            { text: '종료', onPress: () => BackHandler.exitApp() },
          ]);
          return true;
        });
        return () => sub.remove();
      }
    }, [currentPath])
  );
}
