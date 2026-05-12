import { Camera } from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import ToolbarButton from './ToolbarButton';

interface PhotoButtonProps {
  onAdd: (uris: string[]) => void;
}

export default function PhotoButton({ onAdd }: PhotoButtonProps) {
  const handlePress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }
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
