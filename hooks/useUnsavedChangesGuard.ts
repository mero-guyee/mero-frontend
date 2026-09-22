import { useAppModal } from '@/contexts';
import { usePreventRemove } from '@react-navigation/native';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

export function useUnsavedChangesGuard(isDirty: boolean) {
  const navigation = useNavigation();
  const router = useRouter();
  const bypassRef = useRef(false);
  const { showConfirm } = useAppModal();

  useFocusEffect(
    useCallback(() => {
      bypassRef.current = false;
    }, [])
  );

  const confirmLeave = useCallback(
    async (leave: () => void) => {
      if (!isDirty || bypassRef.current) {
        leave();
        return;
      }
      const confirmed = await showConfirm(
        '저장하지 않고 나가시겠습니까?',
        '작성한 내용이 사라집니다.',
        { confirmText: '나가기', cancelText: '계속 작성', destructive: true }
      );
      if (!confirmed) return;
      bypassRef.current = true;
      leave();
    },
    [isDirty, showConfirm]
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
