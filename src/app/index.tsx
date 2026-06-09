import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { isOnboardingCompleted } from '@/services/user-storage';

/**
 * 앱 진입점: 인증 상태에 따라 분기
 * - 미로그인 → (auth)/login
 * - 로그인 + 온보딩 미완료 → (onboarding)/pet-profile
 * - 로그인 + 온보딩 완료 → (tabs)
 */
export default function EntryScreen() {
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) {
      router.replace('/(auth)/login');
      return;
    }

    // 온보딩 체크
    checkOnboarding();
  }, [isLoggedIn, isLoading]);

  async function checkOnboarding() {
    try {
      const completed = await isOnboardingCompleted();
      if (completed) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/pet-profile');
      }
    } catch {
      router.replace('/(tabs)');
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#E88D67" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF6F0',
  },
});
