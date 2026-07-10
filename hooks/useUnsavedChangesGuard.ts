import { usePreventRemove } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Alert, BackHandler } from 'react-native';

export function useUnsavedChangesGuard(isDirty: boolean) {
  const navigation = useNavigation();
  const router = useRouter();
  const bypassRef = useRef(false);

  const confirmLeave = useCallback(
    (leave: () => void) => {
      if (!isDirty || bypassRef.current) {
        leave();
        return;
      }
      Alert.alert('저장하지 않고 나가시겠습니까?', '작성한 내용이 사라집니다.', [
        { text: '계속 작성', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: () => {
            bypassRef.current = true;
            leave();
          },
        },
      ]);
    },
    [isDirty]
  );

  usePreventRemove(isDirty, ({ data }) => {
    if (bypassRef.current) {
      navigation.dispatch(data.action);
      return;
    }
    confirmLeave(() => navigation.dispatch(data.action));
  });

  useEffect(() => {
    if (!isDirty) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmLeave(() => router.back());
      return true;
    });
    return () => sub.remove();
  }, [isDirty, confirmLeave, router]);

  const markSaved = useCallback(() => {
    bypassRef.current = true;
  }, []);

  return { confirmLeave, markSaved };
}
