import { ArrowLeft } from '@tamagui/lucide-icons';
import { WebView } from 'react-native-webview';
import { YStack } from 'tamagui';
import { IconButton } from './button/BaseButton';
import { MediaModal } from './MediaModal';

interface PdfModalProps {
  uri: string | null;
  onClose: () => void;
}

export function PdfModal({ uri, onClose }: PdfModalProps) {
  return (
    <MediaModal visible={!!uri} onClose={onClose}>
      <YStack bg="$muted" flex={1} mt={10}>
        <YStack paddingTop="$10" paddingHorizontal="$4" alignItems="flex-start">
          <IconButton onPress={onClose}>
            <ArrowLeft size="6.5" color="$foreground" />
          </IconButton>
        </YStack>
        {uri && (
          <WebView
            source={{ uri }}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            allowingReadAccessToURL={uri}
          />
        )}
      </YStack>
    </MediaModal>
  );
}
