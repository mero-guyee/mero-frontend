import { usePermissionRequest } from '@/hooks/usePermissionRequest';
import { Camera, Image as ImageIcon } from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text, XStack } from 'tamagui';
import AppBottomSheet from './AppBottomSheet';

interface ImagePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (uri: string) => void;
  aspect?: [number, number];
}

export default function ImagePickerSheet({
  open,
  onOpenChange,
  onSelect,
  aspect = [16, 9],
}: ImagePickerSheetProps) {
  const requestPermission = usePermissionRequest();

  const launchCamera = async () => {
    const granted = await requestPermission(
      () => ImagePicker.requestCameraPermissionsAsync(),
      '설정에서 카메라 접근 권한을 허용해주세요.',
      () => onOpenChange(false)
    );
    if (!granted) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onSelect(result.assets[0].uri);
      onOpenChange(false);
    }
  };

  const launchGallery = async () => {
    const granted = await requestPermission(
      () => ImagePicker.requestMediaLibraryPermissionsAsync(),
      '설정에서 갤러리 접근 권한을 허용해주세요.',
      () => onOpenChange(false)
    );
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onSelect(result.assets[0].uri);
      onOpenChange(false);
    }
  };

  return (
    <AppBottomSheet open={open} onOpenChange={onOpenChange}>
      <XStack onPress={launchCamera} padding="$4" alignItems="center" gap="$3">
        <Camera size={20} color="$foreground" />
        <Text color="$foreground" fontSize={16}>
          사진 찍기
        </Text>
      </XStack>
      <XStack onPress={launchGallery} padding="$4" alignItems="center" gap="$3">
        <ImageIcon size={20} color="$foreground" />
        <Text color="$foreground" fontSize={16}>
          갤러리에서 선택
        </Text>
      </XStack>
    </AppBottomSheet>
  );
}
