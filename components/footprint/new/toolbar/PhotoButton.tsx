import { usePermissionRequest } from '@/hooks/usePermissionRequest';
import { Camera } from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import ToolbarButton from './ToolbarButton';

interface PhotoButtonProps {
  onAdd: (uris: string[]) => void;
}

export default function PhotoButton({ onAdd }: PhotoButtonProps) {
  const requestPermission = usePermissionRequest();

  const handlePress = async () => {
    const granted = await requestPermission(
      () => ImagePicker.requestMediaLibraryPermissionsAsync(),
      '설정에서 갤러리 접근 권한을 허용해주세요.'
    );
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      onAdd(result.assets.map((a) => a.uri));
    }
  };

  return (
    <ToolbarButton onPress={handlePress}>
      <Camera size={24} color="$foreground" />
    </ToolbarButton>
  );
}
