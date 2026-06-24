import FootprintToolbar from '@/components/footprint/new/toolbar/FootprintToolbar';
import MetadataChips from '@/components/footprint/new/toolbar/MetadataChips';
import SubmitButton from '@/components/ui/button/SubmitButton';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { useFootprintForm } from '@/hooks/form/useFootprintForm';
import { X } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView } from 'react-native';
import { Image, TextArea, XStack, YStack } from 'tamagui';

export default function FootprintFormScreen() {
  const router = useRouter();
  const {
    existingFootprint,
    title,
    setTitle,
    date,
    setDate,
    content,
    setContent,
    weatherInfo,
    setWeatherInfo,
    locations,
    setLocations,
    photoUrls,
    handleAddPhotos,
    handleRemovePhoto,
    handleSubmit,
  } = useFootprintForm();

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader
        label={existingFootprint ? '유랑 수정' : '새 유랑'}
        onBack={() => router.back()}
      >
        <SubmitButton onPress={handleSubmit} />
      </BackActionHeader>

      <FadeWrapper>
        <YStack flex={1}>
          <FootprintToolbar
            date={date}
            onDateChange={setDate}
            weatherInfo={weatherInfo}
            onWeatherChange={setWeatherInfo}
            onLocationAdd={(loc) => setLocations((prev) => [...prev, loc])}
            onPhotoAdd={handleAddPhotos}
          />

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            <TextArea
              placeholder="제목을 입력해주세요"
              placeholderTextColor="$placeholderForeground"
              value={title}
              onChangeText={setTitle}
              color="$foreground"
              fontSize={20}
              fontWeight="600"
              borderWidth={0}
              padding={0}
              marginBottom="$3"
            />
            <YStack borderBottomWidth={1} borderColor="$secondary" marginBottom="$3" />
            <TextArea
              placeholder="어떤 여행이었나요? 자유롭게 작성해주세요"
              placeholderTextColor="$placeholderForeground"
              value={content}
              onChangeText={setContent}
              color="$foreground"
              minHeight={200}
              padding={0}
              verticalAlign="top"
              borderWidth={0}
              marginBottom="$5"
            />

            <MetadataChips date={date} locations={locations} weatherInfo={weatherInfo} />

            {photoUrls.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2">
                  {photoUrls.map((uri, index) => (
                    <YStack key={index} position="relative">
                      <Image
                        source={{ uri }}
                        width={100}
                        height={100}
                        borderRadius={8}
                        objectFit="cover"
                      />
                      <Pressable
                        onPress={() => handleRemovePhoto(index)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          borderRadius: 10,
                          padding: 3,
                        }}
                      >
                        <X size={12} color="white" />
                      </Pressable>
                    </YStack>
                  ))}
                </XStack>
              </ScrollView>
            )}
          </ScrollView>
        </YStack>
      </FadeWrapper>
    </YStack>
  );
}
