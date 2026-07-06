import { Pressable } from 'react-native';
import { Image } from 'tamagui';
import { MediaModal } from './MediaModal';

interface PhotoModalProps {
  uri: string | null;
  onClose: () => void;
}

export function PhotoModal({ uri, onClose }: PhotoModalProps) {
  return (
    <MediaModal visible={!!uri} onClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.9)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}
      >
        {uri && (
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '80%' }}
            resizeMode="contain"
          />
        )}
      </Pressable>
    </MediaModal>
  );
}
