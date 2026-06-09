import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputField from '@/components/common/InputField';
import Button from '@/components/common/Button';
import { signInWithEmail } from '@/services/auth';
import { KakaoIcon, GoogleIcon, AppleIcon } from '@/components/common/BrandIcons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert('이메일과 비밀번호를 입력해주세요.');
      } else {
        Alert.alert('입력 필요', '이메일과 비밀번호를 입력해주세요.');
      }
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/');
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = error.message || '';
      let alertMsg = '다시 시도해주세요.';
      if (msg.includes('Invalid login')) {
        alertMsg = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (msg) {
        alertMsg = msg;
      }
      if (Platform.OS === 'web') {
        window.alert(alertMsg);
      } else {
        Alert.alert('로그인 실패', alertMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSocialStub(provider: string) {
    if (Platform.OS === 'web') {
      window.alert(`${provider} 로그인은 준비 중입니다.`);
    } else {
      Alert.alert('준비 중', `${provider} 로그인은 준비 중입니다.`);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* 로고 영역 */}
          <View style={styles.logoSection}>
            <Text style={styles.title}>우리 아이 일기</Text>
            <Text style={styles.subtitle}>반려동물이 쓰는 매일매일 일기</Text>
          </View>

          {/* 입력 폼 */}
          <View style={styles.form}>
            <InputField
              label="이메일"
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <InputField
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="로그인"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              style={styles.loginBtn}
            />
          </View>

          {/* 소셜 로그인 */}
          <View style={styles.socialSection}>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtons}>
              {/* 카카오 - 공식: #FEE500 배경, 검정 텍스트 */}
              <TouchableOpacity
                style={[styles.socialBtn, styles.kakaoBtn]}
                onPress={() => handleSocialStub('카카오')}
                activeOpacity={0.8}
              >
                <KakaoIcon size={18} />
                <Text style={styles.kakaoBtnText}>카카오 로그인</Text>
              </TouchableOpacity>

              {/* Google - 공식: 흰 배경, 회색 테두리 */}
              <TouchableOpacity
                style={[styles.socialBtn, styles.googleBtn]}
                onPress={() => handleSocialStub('Google')}
                activeOpacity={0.8}
              >
                <GoogleIcon size={18} />
                <Text style={styles.googleBtnText}>Google로 로그인</Text>
              </TouchableOpacity>

              {/* Apple - 공식: 검정 배경, 흰 텍스트 (iOS만) */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.socialBtn, styles.appleBtn]}
                  onPress={() => handleSocialStub('Apple')}
                  activeOpacity={0.8}
                >
                  <AppleIcon size={18} />
                  <Text style={styles.appleBtnText}>Apple로 로그인</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 회원가입 링크 */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>아직 계정이 없으신가요? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  flex: { flex: 1 },
  content: { padding: 24, paddingTop: 48 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C' },
  subtitle: { fontSize: 16, fontFamily: 'Gaegu_400Regular', color: '#B0A090', marginTop: 4 },
  form: { marginBottom: 24 },
  loginBtn: { marginTop: 8 },
  socialSection: { marginBottom: 24 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  divider: { flex: 1, height: 1, backgroundColor: '#E8DDD0' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: '#B0A090', fontFamily: 'Gaegu_400Regular' },
  socialButtons: { gap: 10 },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  kakaoBtn: { backgroundColor: '#FEE500' },
  kakaoBtnText: { fontSize: 15, fontWeight: '600', color: '#191919' },
  googleBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DADCE0' },
  googleBtnText: { fontSize: 15, fontWeight: '500', color: '#3C4043' },
  appleBtn: { backgroundColor: '#000000' },
  appleBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 14, color: '#B0A090', fontFamily: 'Gaegu_400Regular' },
  registerLink: { fontSize: 14, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
});

