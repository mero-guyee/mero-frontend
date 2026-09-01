import { IconButton } from '@/components/ui/button/BaseButton';
import SubmitButton from '@/components/ui/button/SubmitButton';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { Trash2 } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { TextArea, XStack, YStack } from 'tamagui';
import { useAppModal, useMemos } from '../../../contexts';

export default function MemoFormScreen() {
  const { tripId, memoId } = useLocalSearchParams<{ tripId: string; memoId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { memos, addMemo, updateMemo, deleteMemo } = useMemos();
  const { showConfirm } = useAppModal();

  const existingMemo = memoId ? memos.find((n) => n.id === memoId) : undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (existingMemo) {
      setTitle(existingMemo.title);
      setContent(existingMemo.content);
    }
  }, [existingMemo]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    if (existingMemo) {
      updateMemo({
        ...existingMemo,
        title: title.trim(),
        content,
      });
      router.back();
      return;
    }

    try {
      await addMemo({
        tripId: tripId || '',
        title: title.trim(),
        content,
      });
      router.back();
    } catch {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '메모를 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
  };

  const handleDelete = async () => {
    if (!existingMemo) return;
    const confirmed = await showConfirm('메모 삭제', '이 메모를 삭제하시겠습니까?', {
      confirmText: '삭제',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteMemo(existingMemo.id);
      router.back();
    } catch {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '메모를 삭제하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader onBack={() => router.back()}>
        <XStack alignItems="center" gap="$2">
          {existingMemo && (
            <IconButton onPress={handleDelete}>
              <Trash2 size="$6.5" color="$destructiveText" />
            </IconButton>
          )}
          <SubmitButton
            onPress={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            opacity={title.trim() && content.trim() ? 1 : 0.5}
          />
        </XStack>
      </BackActionHeader>
      <FadeWrapper>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <YStack flex={1} justifyContent="flex-start" gap="$3">
            <TextArea
              placeholder="제목을 입력해주세요"
              placeholderTextColor="$placeholderForeground"
              value={title}
              onChangeText={setTitle}
              fontSize={20}
              fontWeight="600"
              color="$foreground"
              borderWidth={0}
              padding={0}
            />
            <YStack borderBottomWidth={1} borderColor="$mutedStrong" />
            <TextArea
              placeholder="여행에 도움이 될 만한 간단한 메모를 남겨보세요"
              placeholderTextColor="$placeholderForeground"
              value={content}
              onChangeText={setContent}
              color="$foreground"
              minHeight={200}
              padding={0}
              verticalAlign={'top'}
              borderWidth={0}
            />
          </YStack>
        </ScrollView>
      </FadeWrapper>
    </YStack>
  );
}
