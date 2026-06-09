import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="pet-profile" />
      <Stack.Screen name="pet-info" />
      <Stack.Screen name="guardian-info" />
    </Stack>
  );
}
