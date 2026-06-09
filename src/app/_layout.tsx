import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Gaegu_300Light, Gaegu_400Regular, Gaegu_700Bold } from '@expo-google-fonts/gaegu';
import { AuthProvider } from '@/contexts/auth-context';
import { PetProvider } from '@/contexts/pet-context';
import { WriteProvider } from '@/contexts/write-context';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Gaegu_300Light,
    Gaegu_400Regular,
    Gaegu_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#E88D67" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PetProvider>
          <WriteProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="write" />
              <Stack.Screen name="diary" />
              <Stack.Screen name="mypage" />
            </Stack>
          </WriteProvider>
        </PetProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF9',
  },
});
