import { Camera, Image as ImageIcon } from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet, Text, XStack } from 'tamagui';

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
  const insets = useSafeAreaInsets();

  const launchCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }
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
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }
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
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPointsMode="fit"
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        animation="lazy"
        bg="rgba(0,0,0,0.6)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame paddingBottom={insets.bottom || 8}>
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
      </Sheet.Frame>
    </Sheet>
  );
}
