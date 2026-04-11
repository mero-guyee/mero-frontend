import SubmitButton from '@/components/ui/button/SubmitButton';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, TextArea, XStack, YStack } from 'tamagui';
import { CircularButton, Input } from '../../../components/ui';
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
      <XStack
        backgroundColor="$card"
        paddingTop={insets.top}
        paddingHorizontal="$4"
        paddingBottom="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={2}
        borderBottomColor="$primary"
        style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
      >
        <CircularButton onPress={() => router.back()}>
          <ArrowLeft size={20} color="$foreground" />
        </CircularButton>
        <Text color="$foreground" fontSize={16} fontWeight="500">
          {existingMemo ? '메모 수정' : '새 메모'}
        </Text>
        <SubmitButton
          onPress={handleSubmit}
          disabled={!title.trim()}
          opacity={title.trim() ? 1 : 0.5}
        />
      </XStack>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <YStack marginBottom="$4">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            제목
          </Text>
          <Input
            backgroundColor="$card"
            borderWidth={1}
            borderColor="$border"
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
            placeholder="메모 제목을 입력하세요"
            placeholderTextColor="$mutedForeground"
            value={title}
            onChangeText={setTitle}
            color="$foreground"
          />
        </YStack>

        <YStack marginBottom="$4">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            내용
          </Text>
          <TextArea
            backgroundColor="$card"
            borderWidth={1}
            borderColor="$border"
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
            placeholder="내용을 입력하세요"
            placeholderTextColor="$mutedForeground"
            value={content}
            onChangeText={setContent}
            color="$foreground"
            minHeight={200}
            textAlignVertical="top"
          />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
