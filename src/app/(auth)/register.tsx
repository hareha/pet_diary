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
import { signUpWithEmail } from '@/services/auth';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password) {
      Alert.alert('입력 필요', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('비밀번호 불일치', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('비밀번호 오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('약관 동의 필요', '이용약관에 동의해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password);
      // 유저가 생성되었으면 (identities가 비어있으면 이미 존재하는 계정)
      if (result.user && result.user.identities && result.user.identities.length === 0) {
        if (Platform.OS === 'web') {
          window.alert('이미 가입된 이메일입니다. 로그인을 시도해주세요.');
        } else {
          Alert.alert('가입 실패', '이미 가입된 이메일입니다. 로그인을 시도해주세요.');
        }
        return;
      }
      // 성공 → 바로 이동
      router.replace('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      const msg = error.message || '';
      let alertMsg = '다시 시도해주세요.';
      if (msg.includes('already registered') || msg.includes('already_exists')) {
        alertMsg = '이미 가입된 이메일입니다. 로그인을 시도해주세요.';
      } else if (msg.includes('weak_password') || msg.includes('at least')) {
        alertMsg = '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.';
      } else if (msg.includes('invalid') && msg.includes('email')) {
        alertMsg = '유효한 이메일 주소를 입력해주세요.';
      } else if (msg) {
        alertMsg = msg;
      }
      if (Platform.OS === 'web') {
        window.alert(alertMsg);
      } else {
        Alert.alert('가입 실패', alertMsg);
      }
    } finally {
      setLoading(false);
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
          {/* 헤더 */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← 뒤로</Text>
          </TouchableOpacity>

          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>우리 아이 일기를 시작해볼까요?</Text>

          {/* 폼 */}
          <View style={styles.form}>
            <InputField
              label="이메일"
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />
            <InputField
              label="비밀번호"
              placeholder="6자 이상 입력"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              required
            />
            <InputField
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              required
              error={confirmPassword && password !== confirmPassword ? '비밀번호가 일치하지 않습니다' : undefined}
            />
          </View>

          {/* 약관 동의 */}
          <View style={styles.termsSection}>
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <Text style={styles.checkmark}></Text>}
              </View>
              <Text style={styles.termsText}>이용약관 및 개인정보처리방침에 동의합니다</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/terms')}>
              <Text style={styles.termsLink}>약관 보기 →</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="가입하기"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            disabled={!agreeTerms}
          />

          {/* 소셜 회원가입 */}
          <View style={styles.socialSection}>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.divider} />
            </View>
            <TouchableOpacity style={[styles.socialBtn, styles.kakaoBtn]} onPress={() => Alert.alert('준비 중')}>
              <Text style={styles.socialBtnText}>카카오로 가입</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialBtn, styles.googleBtn]} onPress={() => Alert.alert('준비 중')}>
              <Text style={[styles.socialBtnText, styles.googleBtnText]}>Google로 가입</Text>
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
  content: { padding: 24 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  title: { fontSize: 28, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 4 },
  subtitle: { fontSize: 15, fontFamily: 'Gaegu_400Regular', color: '#B0A090', marginBottom: 28 },
  form: { marginBottom: 16 },
  termsSection: { marginBottom: 20 },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#E8DDD0',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: '#E88D67', borderColor: '#E88D67' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  termsText: { fontSize: 14, color: '#5D4E3C', fontFamily: 'Gaegu_400Regular', flex: 1 },
  termsLink: { fontSize: 13, color: '#E88D67', fontFamily: 'Gaegu_700Bold', marginLeft: 32 },
  socialSection: { marginTop: 24, gap: 10 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  divider: { flex: 1, height: 1, backgroundColor: '#E8DDD0' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: '#B0A090' },
  socialBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  kakaoBtn: { backgroundColor: '#FEE500' },
  googleBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0' },
  socialBtnText: { fontSize: 15, fontWeight: '600', color: '#3C1E1E' },
  googleBtnText: { color: '#333' },
});
