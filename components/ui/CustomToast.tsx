import { WifiOff } from '@tamagui/lucide-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Text as TText, View as TView, useTheme, XStack } from 'tamagui';

type ToastProps = {
  text1?: string;
  text2?: string;
};

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  indicator: {
    width: 4,
    borderRadius: 4,
    alignSelf: 'stretch',
    minHeight: 20,
  },
  content: {
    flex: 1,
  },
  text1: {
    fontSize: 14,
    fontWeight: '600',
  },
  text2: {
    fontSize: 13,
    marginTop: 2,
  },
});

type IndicatorColorKey = 'accentStrong' | 'destructiveText' | 'placeholderForeground';

function ToastCard({
  text1,
  text2,
  indicatorColorKey,
}: ToastProps & { indicatorColorKey: IndicatorColorKey }) {
  const theme = useTheme();
  const indicatorColor = theme[indicatorColorKey].val;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card.val,
          borderWidth: 1,
          borderColor: hexToRgba(indicatorColor, 0.4),
        },
      ]}
    >
      <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
      <View style={styles.content}>
        {text1 ? (
          <Text style={[styles.text1, { color: theme.foreground.val }]}>{text1}</Text>
        ) : null}
        {text2 ? (
          <Text style={[styles.text2, { color: theme.mutedForeground.val }]}>{text2}</Text>
        ) : null}
      </View>
    </View>
  );
}

function OfflineToastCard({ hide }: { hide: () => void }) {
  return (
    <XStack
      backgroundColor="$destructive"
      borderRadius="$6"
      paddingVertical="$2.5"
      paddingHorizontal="$2.5"
      alignItems="center"
      gap="$2.5"
      width="90%"
    >
      <TView
        width={28}
        height={28}
        borderRadius={999}
        backgroundColor="rgba(255,255,255,0.25)"
        alignItems="center"
        justifyContent="center"
      >
        <WifiOff size={14} color="$destructiveForeground" />
      </TView>
      <TText color="$destructiveForeground" fontSize={13} fontWeight="600" flex={1}>
        오프라인 상태예요{'\n'}
        <TText color="$destructiveForeground" fontSize={11} fontWeight="400" opacity={0.85}>
          저장한 내용은 다시 연결되면 동기화돼요
        </TText>
      </TText>
      <Pressable onPress={hide} hitSlop={8}>
        <TView
          backgroundColor="rgba(255,255,255,0.25)"
          borderRadius={999}
          paddingVertical="$1.5"
          paddingHorizontal="$3"
        >
          <TText color="$destructiveForeground" fontSize={12} fontWeight="600">
            확인
          </TText>
        </TView>
      </Pressable>
    </XStack>
  );
}

export const toastConfig = {
  success: ({ text1, text2 }: ToastProps) => (
    <ToastCard text1={text1} text2={text2} indicatorColorKey="accentStrong" />
  ),
  error: ({ text1, text2 }: ToastProps) => (
    <ToastCard text1={text1} text2={text2} indicatorColorKey="destructiveText" />
  ),
  info: ({ text1, text2 }: ToastProps) => (
    <ToastCard text1={text1} text2={text2} indicatorColorKey="placeholderForeground" />
  ),
  handleBackPress: ({ text1, text2 }: ToastProps) => (
    <ToastCard text1={text1} text2={text2} indicatorColorKey="placeholderForeground" />
  ),
  offline: ({ hide }: { hide: () => void }) => <OfflineToastCard hide={hide} />,
};
