import AppBottomSheet from '@/components/ui/AppBottomSheet';
import { inputStyle } from '@/components/ui/Input';
import { ExpenseCategory } from '@/types';
import { ChevronRight } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Sheet, Text, XStack, YStack } from 'tamagui';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  categories: ExpenseCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  renderTrigger?: (onPress: () => void) => React.ReactNode;
}

export default function CategoryPicker({ categories, value, onChange, renderTrigger }: Props) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((cat) => cat.id === value);

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <Pressable onPress={() => setOpen(true)}>
          <XStack {...inputStyle} alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              {selected && <CategoryIcon name={selected.name} size={18} />}
              <Text color="$foreground">{selected?.name ?? '카테고리 선택'}</Text>
            </XStack>
            <ChevronRight size={18} color="$mutedForeground" />
          </XStack>
        </Pressable>
      )}

      <AppBottomSheet open={open} onOpenChange={setOpen} frameProps={{ padding: '$4' }}>
        <Text color="$foreground" fontWeight="600" fontSize={16} marginBottom="$4" marginTop="$2">
          카테고리 선택
        </Text>
        <Sheet.ScrollView>
          <YStack gap="$1">
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => {
                  onChange(cat.id);
                  setOpen(false);
                }}
              >
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$3"
                  borderRadius="$3"
                  backgroundColor={value === cat.id ? '$accent' : 'transparent'}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <XStack alignItems="center" gap="$2">
                    <CategoryIcon name={cat.name} size={18} />
                    <Text
                      color="$foreground"
                      fontSize={15}
                      fontWeight={value === cat.id ? '600' : '400'}
                    >
                      {cat.name}
                    </Text>
                  </XStack>
                  {value === cat.id && (
                    <Text color="$foreground" fontSize={14}>
                      ✓
                    </Text>
                  )}
                </XStack>
              </Pressable>
            ))}
          </YStack>
        </Sheet.ScrollView>
      </AppBottomSheet>
    </>
  );
}
