import { FilledButton } from '@/components/ui';
import { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { Dialog, Text, YStack, XStack } from 'tamagui';

type ConfirmOptions = {
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type ModalState = {
  visible: boolean;
  title: string;
  message?: string;
  confirmText: string;
  cancelText?: string;
  destructive: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

type AppModalContextValue = {
  showAlert: (title: string, message?: string, confirmText?: string) => Promise<void>;
  showConfirm: (title: string, message?: string, options?: ConfirmOptions) => Promise<boolean>;
};

const AppModalContext = createContext<AppModalContextValue | null>(null);

const initialState: ModalState = {
  visible: false,
  title: '',
  message: undefined,
  confirmText: '확인',
  cancelText: undefined,
  destructive: false,
  onConfirm: () => {},
  onCancel: undefined,
};

export function AppModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>(initialState);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const showAlert = useCallback<AppModalContextValue['showAlert']>(
    (title, message, confirmText = '확인') => {
      return new Promise((resolve) => {
        setState({
          visible: true,
          title,
          message,
          confirmText,
          cancelText: undefined,
          destructive: false,
          onConfirm: () => {
            close();
            resolve();
          },
          onCancel: undefined,
        });
      });
    },
    [close]
  );

  const showConfirm = useCallback<AppModalContextValue['showConfirm']>(
    (title, message, options) => {
      return new Promise((resolve) => {
        setState({
          visible: true,
          title,
          message,
          confirmText: options?.confirmText ?? '확인',
          cancelText: options?.cancelText ?? '취소',
          destructive: options?.destructive ?? false,
          onConfirm: () => {
            close();
            resolve(true);
          },
          onCancel: () => {
            close();
            resolve(false);
          },
        });
      });
    },
    [close]
  );

  return (
    <AppModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Dialog
        modal
        open={state.visible}
        onOpenChange={(open) => {
          if (!open) {
            (state.onCancel ?? close)();
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="lazy"
            backgroundColor="rgba(0,0,0,0.5)"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            key="content"
            elevate
            animation="fast"
            enterStyle={{ opacity: 0, scale: 0.95 }}
            exitStyle={{ opacity: 0, scale: 0.95 }}
            backgroundColor="$card"
            borderRadius="$5"
            padding="$5"
            width="82%"
            maxWidth={340}
            gap="$4"
          >
            <YStack gap="$2">
              <Text fontSize={17} fontWeight="700" color="$foreground" textAlign="center">
                {state.title}
              </Text>
              {state.message ? (
                <Text fontSize={14} color="$mutedForeground" textAlign="center">
                  {state.message}
                </Text>
              ) : null}
            </YStack>
            <XStack gap="$3">
              {state.cancelText ? (
                <FilledButton
                  flex={1}
                  backgroundColor="$muted"
                  pressStyle={{ backgroundColor: '$mutedPress' }}
                  onPress={() => state.onCancel?.()}
                >
                  <Text color="$foreground" fontWeight="600">
                    {state.cancelText}
                  </Text>
                </FilledButton>
              ) : null}
              <FilledButton
                flex={1}
                backgroundColor={state.destructive ? '$destructive' : '$accent'}
                pressStyle={{
                  backgroundColor: state.destructive ? '$destructive' : '$accentPress',
                }}
                onPress={() => state.onConfirm()}
              >
                <Text
                  color={state.destructive ? '$destructiveForeground' : '$foreground'}
                  fontWeight="600"
                >
                  {state.confirmText}
                </Text>
              </FilledButton>
            </XStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </AppModalContext.Provider>
  );
}

export function useAppModal() {
  const ctx = useContext(AppModalContext);
  if (!ctx) {
    throw new Error('useAppModal must be used within AppModalProvider');
  }
  return ctx;
}
