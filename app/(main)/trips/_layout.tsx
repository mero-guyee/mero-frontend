import { NewTripFormProvider } from '@/contexts/MultiStepForm/NewTripFormContext';
import { Stack } from 'expo-router';

export default function TripsLayout() {
  return (
    <NewTripFormProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="new" />
      </Stack>
    </NewTripFormProvider>
  );
}
