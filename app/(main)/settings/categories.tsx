import { CategoryIcon } from '@/components/expense/CategoryIcon';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { Edit3, GripVertical, Plus, Trash2 } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { CircularButton, FilledButton } from '../../../components/ui';
import { useExpenses } from '../../../contexts';

const CATEGORY_ICON_NAMES: Record<string, string> = {
  restaurant: 'utensils',
  directions_bus: 'bus',
  hotel: 'hotel',
  directions_walk: 'theater',
  shopping_cart: 'shopping_bag',
  more_horiz: 'package',
};

export default function CategoryManagerScreen() {
  const router = useRouter();
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
      <BackActionHeader onBack={() => router.back()} label="카테고리 관리">
        <CircularButton onPress={handleAddCategory}>
          <Plus size={20} color="$foreground" />
        </CircularButton>
      </BackActionHeader>
      <XStack paddingHorizontal="$4" paddingBottom="$3">
        <FilledButton
          backgroundColor={isEditing ? '$primary' : '$muted'}
          pressStyle={{ opacity: 0.8 }}
          paddingHorizontal="$4"
          paddingVertical="$2"
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text color={isEditing ? 'white' : '$foreground'}>{isEditing ? '완료' : '편집'}</Text>
        </FilledButton>
      </XStack>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <YStack gap="$2">
          {categories.map((category) => {
            const iconName = CATEGORY_ICON_NAMES[category.icon] ?? category.icon;

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
                {isEditing && <GripVertical size={20} color="$mutedForeground" />}
                <YStack
                  width={40}
                  height={40}
                  borderRadius={20}
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <CategoryIcon name={iconName} size={20} />
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
