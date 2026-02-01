import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Pressable, Alert } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { ArrowLeft, Plus, Edit3, Trash2, GripVertical } from '@tamagui/lucide-icons';
import { useExpenses } from '../../../contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORY_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  directions_bus: '🚌',
  hotel: '🏨',
  directions_walk: '🎭',
  shopping_cart: '🛍️',
  more_horiz: '📦',
};

export default function CategoryManagerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categories, deleteCategory } = useExpenses();

  const [isEditing, setIsEditing] = useState(false);

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert('카테고리 삭제', '이 카테고리를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteCategory(categoryId),
      },
    ]);
  };

  const handleAddCategory = () => {
    Alert.alert('알림', '카테고리 추가 기능은 준비 중입니다.');
  };

  const handleEditCategory = (categoryId: string) => {
    Alert.alert('알림', '카테고리 수정 기능은 준비 중입니다.');
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack
        backgroundColor="$card"
        paddingTop={insets.top}
        borderBottomWidth={2}
        borderBottomColor="$primary"
        style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
      >
        <XStack paddingHorizontal="$4" paddingVertical="$3" alignItems="center" justifyContent="space-between">
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
            카테고리 관리
          </Text>
          <Button
            size="$4"
            circular
            backgroundColor="transparent"
            pressStyle={{ backgroundColor: '$accent' }}
            onPress={handleAddCategory}
          >
            <Plus size={20} color="$foreground" />
          </Button>
        </XStack>
        <XStack paddingHorizontal="$4" paddingBottom="$3">
          <Button
            backgroundColor={isEditing ? '$primary' : '$muted'}
            pressStyle={{ opacity: 0.8 }}
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$2"
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text color={isEditing ? 'white' : '$foreground'}>
              {isEditing ? '완료' : '편집'}
            </Text>
          </Button>
        </XStack>
      </YStack>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <YStack gap="$2">
          {categories.map((category) => {
            const icon = CATEGORY_ICONS[category.icon] || category.icon;

            return (
              <XStack
                key={category.id}
                backgroundColor="$card"
                borderRadius="$4"
                padding="$4"
                alignItems="center"
                gap="$3"
                borderWidth={1}
                borderColor="$border"
              >
                {isEditing && (
                  <GripVertical size={20} color="$mutedForeground" />
                )}
                <YStack
                  width={40}
                  height={40}
                  borderRadius={20}
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <Text fontSize={20}>{icon}</Text>
                </YStack>
                <Text flex={1} color="$foreground">
                  {category.name}
                </Text>
                {isEditing && (
                  <XStack gap="$2">
                    <Pressable onPress={() => handleEditCategory(category.id)}>
                      <YStack
                        width={36}
                        height={36}
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="$4"
                      >
                        <Edit3 size={16} color="$foreground" />
                      </YStack>
                    </Pressable>
                    {!category.isDefault && (
                      <Pressable onPress={() => handleDeleteCategory(category.id)}>
                        <YStack
                          width={36}
                          height={36}
                          alignItems="center"
                          justifyContent="center"
                          borderRadius="$4"
                        >
                          <Trash2 size={16} color="$destructive" />
                        </YStack>
                      </Pressable>
                    )}
                  </XStack>
                )}
              </XStack>
            );
          })}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
