import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'tamagui';

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
};
