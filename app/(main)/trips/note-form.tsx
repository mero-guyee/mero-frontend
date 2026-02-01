import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, Button, Input, TextArea } from 'tamagui';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { useTrips } from '../../../contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NoteFormScreen() {
  const { tripId, noteId } = useLocalSearchParams<{ tripId: string; noteId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notes, addNote, updateNote } = useTrips();

  const existingNote = noteId ? notes.find((n) => n.id === noteId) : undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
    }
  }, [existingNote]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const now = new Date().toISOString().split('T')[0];

    if (existingNote) {
      updateNote({
        ...existingNote,
        title: title.trim(),
        content,
        updatedAt: now,
      });
    } else {
      addNote({
        tripId: tripId || '',
        title: title.trim(),
        content,
        tags: [],
        createdAt: now,
        updatedAt: now,
      });
    }

    router.back();
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
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
        <Button
          size="$4"
          circular
          backgroundColor="transparent"
          pressStyle={{ backgroundColor: '$accent' }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="$foreground" />
        </Button>
        <Text color="$foreground" fontSize={16} fontWeight="500">
          {existingNote ? '노트 수정' : '새 노트'}
        </Text>
        <Button
          backgroundColor="$accent"
          pressStyle={{ backgroundColor: '$accentHover' }}
          borderRadius="$4"
          paddingHorizontal="$4"
          paddingVertical="$2"
          onPress={handleSubmit}
          disabled={!title.trim()}
          opacity={title.trim() ? 1 : 0.5}
        >
          <Text color="$foreground" fontWeight="500">
            저장
          </Text>
        </Button>
      </XStack>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Title */}
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
            placeholder="노트 제목을 입력하세요"
            placeholderTextColor="$mutedForeground"
            value={title}
            onChangeText={setTitle}
            color="$foreground"
          />
        </YStack>

        {/* Content */}
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
