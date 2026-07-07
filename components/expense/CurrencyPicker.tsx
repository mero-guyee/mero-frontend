import AppBottomSheet from '@/components/ui/AppBottomSheet';
import { CURRENCIES } from '@/data/constants';
import { ChevronDown } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

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
            {CURRENCIES.map(({ code }) => {
              const isDisabled = disabledCurrencies.includes(code);
              return (
                <Pressable
                  key={code}
                  disabled={isDisabled}
                  onPress={() => {
                    onChange(code);
                    setOpen(false);
                  }}
                >
                  <XStack
                    paddingHorizontal="$3"
                    paddingVertical="$3"
                    borderRadius="$3"
                    backgroundColor={value === code ? '$accent' : 'transparent'}
                    alignItems="center"
                    justifyContent="space-between"
                    opacity={isDisabled ? 0.4 : 1}
                  >
                    <Text
                      color="$foreground"
                      fontSize={15}
                      fontWeight={value === code ? '600' : '400'}
                    >
                      {code}
                    </Text>
                    {isDisabled ? (
                      <Text color="$mutedForeground" fontSize={12}>
                        등록됨
                      </Text>
                    ) : (
                      value === code && (
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
