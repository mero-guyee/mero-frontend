import { StyleSheet, Text, View } from 'react-native';

type ToastProps = {
  text1?: string;
  text2?: string;
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
    color: '#2C2416',
  },
  text2: {
    fontSize: 13,
    color: '#5C5040',
    marginTop: 2,
  },
});

export const toastConfig = {
  success: ({ text1, text2 }: ToastProps) => (
    <View
      style={[
        styles.container,
        { backgroundColor: '#FFFBF0', borderWidth: 1, borderColor: 'rgba(155, 196, 209, 0.4)' },
      ]}
    >
      <View style={[styles.indicator, { backgroundColor: '#9BC4D1' }]} />
      <View style={styles.content}>
        {text1 ? <Text style={styles.text1}>{text1}</Text> : null}
        {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
      </View>
    </View>
  ),
  error: ({ text1, text2 }: ToastProps) => (
    <View
      style={[
        styles.container,
        { backgroundColor: '#FFFBF0', borderWidth: 1, borderColor: 'rgba(210, 120, 100, 0.4)' },
      ]}
    >
      <View style={[styles.indicator, { backgroundColor: '#D27864' }]} />
      <View style={styles.content}>
        {text1 ? <Text style={styles.text1}>{text1}</Text> : null}
        {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
      </View>
    </View>
  ),
  info: ({ text1, text2 }: ToastProps) => (
    <View
      style={[
        styles.container,
        { backgroundColor: '#FFFBF0', borderWidth: 1, borderColor: 'rgba(139, 115, 85, 0.3)' },
      ]}
    >
      <View style={[styles.indicator, { backgroundColor: '#8B7355' }]} />
      <View style={styles.content}>
        {text1 ? <Text style={styles.text1}>{text1}</Text> : null}
        {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
      </View>
    </View>
  ),
  handleBackPress: ({ text1, text2 }: ToastProps) => (
    <View
      style={[
        styles.container,
        { backgroundColor: '#FFFBF0', borderWidth: 1, borderColor: 'rgba(139, 115, 85, 0.3)' },
      ]}
    >
      <View style={[styles.indicator, { backgroundColor: '#8B7355' }]} />
      <View style={styles.content}>
        {text1 ? <Text style={styles.text1}>{text1}</Text> : null}
        {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
      </View>
    </View>
  ),
};
