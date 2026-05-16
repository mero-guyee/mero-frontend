import { ChevronDown } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Sheet, Text, XStack, YStack } from 'tamagui';

const CURRENCIES = ['KRW', 'USD', 'EUR', 'JPY', 'GBP', 'CNY', 'THB', 'VND', 'PEN', 'BRL'];

interface Props {
  value: string;
  onChange: (currency: string) => void;
}

export default function CurrencyPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable onPress={() => setOpen(true)}>
        <XStack paddingHorizontal="$3" alignItems="center" gap="$1">
          <Text color="$foreground">{value}</Text>
          <ChevronDown size={14} color="$mutedForeground" />
        </XStack>
      </Pressable>

      <Sheet open={open} onOpenChange={setOpen} snapPoints={[50]} dismissOnSnapToBottom modal>
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          <Text color="$foreground" fontWeight="600" fontSize={16} marginBottom="$4" marginTop="$2">
            통화 선택
          </Text>
          <ScrollView>
            <YStack gap="$1">
              {CURRENCIES.map((curr) => (
                <Pressable
                  key={curr}
                  onPress={() => {
                    onChange(curr);
                    setOpen(false);
                  }}
                >
                  <XStack
                    paddingHorizontal="$3"
                    paddingVertical="$3"
                    borderRadius="$3"
                    backgroundColor={value === curr ? '$accent' : 'transparent'}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text
                      color="$foreground"
                      fontSize={15}
                      fontWeight={value === curr ? '600' : '400'}
                    >
                      {curr}
                    </Text>
                    {value === curr && (
                      <Text color="$foreground" fontSize={14}>
                        ✓
                      </Text>
                    )}
                  </XStack>
                </Pressable>
              ))}
            </YStack>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
