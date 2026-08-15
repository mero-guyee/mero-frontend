import AppBottomSheet from '@/components/ui/AppBottomSheet';
import { useAppModal } from '@/contexts';
import { usePermissionRequest } from '@/hooks/usePermissionRequest';
import { Camera, FileText, Image as ImageIcon } from '@tamagui/lucide-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
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

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export default function DocumentAddSheet({ open, onOpenChange, onSelect }: DocumentAddSheetProps) {
  const requestPermission = usePermissionRequest();
  const { showAlert } = useAppModal();

  const isOverSizeLimit = async (fileSize?: number) => {
    if (fileSize === undefined || fileSize <= MAX_FILE_SIZE) return false;
    await showAlert('파일 용량 초과', '20MB 이하 파일만 업로드할 수 있어요.');
    return true;
  };

  const launchCamera = async () => {
    const granted = await requestPermission(
      () => ImagePicker.requestCameraPermissionsAsync(),
      '설정에서 카메라 접근 권한을 허용해주세요.',
      () => onOpenChange(false)
    );
    if (!granted) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      if (await isOverSizeLimit(result.assets[0].fileSize)) return;
      onSelect({ fileName: `document_${Date.now()}.jpg`, fileUri: result.assets[0].uri });
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
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      if (await isOverSizeLimit(result.assets[0].fileSize)) return;
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
        const { name, uri, size } = result.assets[0];
        if (await isOverSizeLimit(size)) return;
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
