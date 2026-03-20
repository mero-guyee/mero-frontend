import { Stack } from 'expo-router';

export default function BackpackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="memo-form" />
    </Stack>
  );
}
