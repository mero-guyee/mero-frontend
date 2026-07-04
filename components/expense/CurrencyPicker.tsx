import AppBottomSheet from '@/components/ui/AppBottomSheet';
import { ChevronDown } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

export const CURRENCIES = ['KRW', 'USD', 'EUR', 'JPY', 'GBP', 'CNY', 'THB', 'VND', 'PEN', 'BRL'];

interface Props {
  value: string;
  onChange: (currency: string) => void;
  disabledCurrencies?: string[];
}

export default function CurrencyPicker({ value, onChange, disabledCurrencies = [] }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable onPress={() => setOpen(true)}>
        <XStack paddingHorizontal="$3" alignItems="center" gap="$1">
          <Text color="$foreground">{value}</Text>
          <ChevronDown size={14} color="$mutedForeground" />
        </XStack>
      </Pressable>

      <AppBottomSheet open={open} onOpenChange={setOpen} frameProps={{ padding: '$4' }}>
        <Text color="$foreground" fontWeight="600" fontSize={16} marginBottom="$4" marginTop="$2">
          통화 선택
        </Text>
        <ScrollView>
          <YStack gap="$1">
            {CURRENCIES.map((curr) => {
              const isDisabled = disabledCurrencies.includes(curr);
              return (
                <Pressable
                  key={curr}
                  disabled={isDisabled}
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
                    opacity={isDisabled ? 0.4 : 1}
                  >
                    <Text
                      color="$foreground"
                      fontSize={15}
                      fontWeight={value === curr ? '600' : '400'}
                    >
                      {curr}
                    </Text>
                    {isDisabled ? (
                      <Text color="$mutedForeground" fontSize={12}>
                        등록됨
                      </Text>
                    ) : (
                      value === curr && (
                        <Text color="$foreground" fontSize={14}>
                          ✓
                        </Text>
                      )
                    )}
                  </XStack>
                </Pressable>
              );
            })}
          </YStack>
        </ScrollView>
      </AppBottomSheet>
    </>
  );
}
