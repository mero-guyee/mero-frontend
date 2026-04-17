import { Stack } from 'expo-router';

export default function NewTripLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Country" />
      <Stack.Screen name="DateAndThumbnail" />
      <Stack.Screen name="Title" />
    </Stack>
  );
}
