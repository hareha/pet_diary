import { Stack } from 'expo-router';

export default function MypageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="pet-edit" />
      <Stack.Screen name="guardian-edit" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="account" />
    </Stack>
  );
}
