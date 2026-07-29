import ImagePickerSheet from '@/components/ui/ImagePickerSheet';
import { Camera, X } from '@tamagui/lucide-icons';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, useTheme, XStack, YStack } from 'tamagui';

const DEFAULT_IMAGE = Asset.fromModule(require('@/assets/images/mountain.jpg')).uri;

interface TripCoverImagePickerProps {
  imageUrl?: string;
  onChange: (uri: string) => void;
  onRemove: () => void;
  height?: number;
}

export default function TripCoverImagePicker({
  imageUrl,
  onChange,
  onRemove,
  height = 220,
}: TripCoverImagePickerProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const theme = useTheme();

  return (
    <YStack width="100%" height={height} position="relative" overflow="hidden">
      <Image
        source={{ uri: imageUrl || DEFAULT_IMAGE }}
        contentFit="cover"
        cachePolicy="memory-disk"
        style={{ width: '100%', height: '100%' }}
      />

      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(0,0,0,0.25)"
      />

      <Pressable
        onPress={() => setShowImagePicker(true)}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <YStack flex={1} alignItems="center" justifyContent="center">
          <XStack
            alignItems="center"
            gap="$1.5"
            backgroundColor="rgba(0,0,0,0.5)"
            borderRadius={999}
            paddingHorizontal="$3.5"
            paddingVertical="$2"
          >
            <Camera size={20} color="white" />
            <Text color="white" fontSize={13} fontWeight="600">
              {imageUrl ? '사진 변경' : '커버 사진 선택'}
            </Text>
          </XStack>
        </YStack>
      </Pressable>

      {imageUrl && (
        <Pressable
          onPress={onRemove}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: theme.destructive.val,
            borderRadius: 12,
            padding: 8,
          }}
        >
          <X size={16} color="white" />
        </Pressable>
      )}

      <ImagePickerSheet
        open={showImagePicker}
        onOpenChange={setShowImagePicker}
        onSelect={onChange}
      />
    </YStack>
  );
}
