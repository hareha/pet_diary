import { Stack } from 'expo-router';

export default function DiaryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="[date]" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
