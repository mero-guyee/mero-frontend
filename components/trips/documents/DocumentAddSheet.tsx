import AppBottomSheet from '@/components/ui/AppBottomSheet';
import { Camera, FileText, Image as ImageIcon } from '@tamagui/lucide-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { Text, XStack } from 'tamagui';

interface DocumentFile {
  fileName: string;
  fileUri: string;
}

interface DocumentAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (file: DocumentFile) => void;
}

export default function DocumentAddSheet({ open, onOpenChange, onSelect }: DocumentAddSheetProps) {
  const launchCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onSelect({ fileName: `document_${Date.now()}.jpg`, fileUri: result.assets[0].uri });
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
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onSelect({ fileName: `document_${Date.now()}.jpg`, fileUri: result.assets[0].uri });
      onOpenChange(false);
    }
  };

  const launchFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
      });
      if (!result.canceled && result.assets[0]) {
        const { name, uri } = result.assets[0];
        onSelect({ fileName: name, fileUri: uri });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('File selection error:', error);
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
      <XStack onPress={launchFilePicker} padding="$4" alignItems="center" gap="$3">
        <FileText size={20} color="$foreground" />
        <Text color="$foreground" fontSize={16}>
          파일에서 선택
        </Text>
      </XStack>
    </AppBottomSheet>
  );
}
