import { Check, X } from '@tamagui/lucide-icons';
import isoCountries from 'i18n-iso-countries';
import koLocale from 'i18n-iso-countries/langs/ko.json';
import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, useWindowDimensions } from 'react-native';
import { ScrollView, Text, XStack, YStack, useTheme } from 'tamagui';
import ErrorText from '../ui/multiStepForm/ErrorText';

isoCountries.registerLocale(koLocale);

const ALL_COUNTRIES = Object.values(isoCountries.getNames('ko'));

interface Props {
  selectedCountries: string[];
  onAdd: (country: string) => void;
  onRemove: (country: string) => void;
  error: string | null;
}

export default function TripCountrySearch({ selectedCountries, onAdd, onRemove, error }: Props) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>(ALL_COUNTRIES);
  const { height: screenHeight } = useWindowDimensions();
  const theme = useTheme();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textInputRef = useRef<TextInput>(null);

  const handleQueryChange = (text: string) => {
    setQuery(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const results = ALL_COUNTRIES.filter((name) => name.includes(text.trim()));
      setSearchResults(results.length > 0 ? results : ALL_COUNTRIES);
    }, 300);
  };

  useEffect(() => {
    if (query.trim() === '') {
      setSearchResults(ALL_COUNTRIES);
    }
  }, [query]);

  const handleSelectCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      onRemove(country);
    } else {
      onAdd(country);
      setQuery('');
      setSearchResults(ALL_COUNTRIES);
    }
  };

  return (
    <YStack flex={1}>
      <YStack rowGap="$1.5">
        <YStack>
          <Pressable onPress={() => textInputRef.current?.focus()}>
            <XStack
              flexWrap="wrap"
              gap="$2"
              backgroundColor="$muted"
              borderWidth={2}
              borderColor={error ? '$destructive' : '$border'}
              borderRadius="$4"
              paddingHorizontal="$3"
              paddingVertical="$2.5"
              minHeight="$5"
              alignItems="center"
            >
              {selectedCountries.map((country) => (
                <XStack
                  key={country}
                  alignItems="center"
                  gap="$1"
                  paddingHorizontal="$3"
                  paddingVertical="$1.5"
                  backgroundColor="$accent"
                  borderRadius={20}
                >
                  <Text color="$accentForeground" fontSize={13}>
                    {country}
                  </Text>
                  <Pressable onPress={() => onRemove(country)} hitSlop={8}>
                    <X size={12} color="$accentForeground" />
                  </Pressable>
                </XStack>
              ))}
              <TextInput
                ref={textInputRef}
                value={query}
                onChangeText={handleQueryChange}
                placeholder={selectedCountries.length === 0 ? '국가명을 입력하세요' : ''}
                placeholderTextColor={theme.mutedForeground?.val}
                style={{
                  flex: 1,
                  minWidth: 80,
                  color: theme.foreground?.val,
                  fontSize: 15,
                  paddingVertical: 4,
                }}
              />
            </XStack>
          </Pressable>
          <ErrorText error={error} />
        </YStack>

        <ScrollView
          backgroundColor="$card"
          borderRadius="$6"
          height={screenHeight * 0.5}
          overflow="scroll"
        >
          {searchResults.map((name, index) => {
            const isSelected = selectedCountries.includes(name);
            return (
              <Pressable key={name} onPress={() => handleSelectCountry(name)}>
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  borderTopWidth={index === 0 ? 0 : 1}
                  borderColor="$border"
                  backgroundColor={isSelected ? '$accent' : 'transparent'}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text
                    color={isSelected ? '$accentForeground' : '$foreground'}
                    fontWeight={isSelected ? '600' : '400'}
                  >
                    {name}
                  </Text>
                  {isSelected && <Check size={16} color="$accentForeground" />}
                </XStack>
              </Pressable>
            );
          })}
        </ScrollView>
      </YStack>
    </YStack>
  );
}
