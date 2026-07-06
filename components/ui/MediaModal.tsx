import type { ReactNode } from 'react';
import { Modal } from 'react-native';

interface MediaModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function MediaModal({ visible, onClose, children }: MediaModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {children}
    </Modal>
  );
}
