import SubmitButton from '@/components/ui/button/SubmitButton';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextArea, YStack } from 'tamagui';
import { useMemos } from '../../../contexts';

export default function MemoFormScreen() {
  const { tripId, memoId } = useLocalSearchParams<{ tripId: string; memoId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { memos, addMemo, updateMemo } = useMemos();

  const existingMemo = memoId ? memos.find((n) => n.id === memoId) : undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (existingMemo) {
      setTitle(existingMemo.title);
      setContent(existingMemo.content);
    }
  }, [existingMemo]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (existingMemo) {
      updateMemo({
        ...existingMemo,
        title: title.trim(),
        content,
      });
    } else {
      addMemo({
        tripId: tripId || '',
        title: title.trim(),
        content,
      });
    }

    router.back();
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader label={existingMemo ? '메모 수정' : '새 메모'} onBack={() => router.back()}>
        <SubmitButton
          onPress={handleSubmit}
          disabled={!title.trim()}
          opacity={title.trim() ? 1 : 0.5}
        />
      </BackActionHeader>
      <FadeWrapper>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <YStack flex={1} justifyContent="flex-start" gap="$3">
            <TextArea
              placeholder="제목을 입력해주세요"
              placeholderTextColor="$mutedForeground"
              value={title}
              onChangeText={setTitle}
              color="$foreground"
              borderWidth={0}
              padding={0}
            />
            <YStack borderBottomWidth={1} borderColor="$secondary" />
            <TextArea
              placeholder="여행에 도움이 될 만한 간단한 메모를 남겨보세요"
              placeholderTextColor="$mutedForeground"
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
