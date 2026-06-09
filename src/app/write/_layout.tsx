import { Stack } from 'expo-router';

export default function WriteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="photo-select" />
      <Stack.Screen name="ai-analysis" />
      <Stack.Screen name="situation" />
      <Stack.Screen name="image-style" />
      <Stack.Screen name="thumbnail" />
      <Stack.Screen name="ai-diary" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}
