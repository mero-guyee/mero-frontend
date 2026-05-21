import { Modal, Pressable } from 'react-native';
import { Image } from 'tamagui';

interface PhotoModalProps {
  uri: string | null;
  onClose: () => void;
}

export function PhotoModal({ uri, onClose }: PhotoModalProps) {
  return (
    <Modal visible={!!uri} transparent animationType="fade" onRequestClose={onClose}>
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
    </Modal>
  );
}
