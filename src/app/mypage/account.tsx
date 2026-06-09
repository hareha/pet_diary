import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuList from '@/components/common/MenuList';
import { useAuth } from '@/contexts/auth-context';
import { signOut, deleteAccount } from '@/services/auth';

export default function AccountScreen() {
  const { user } = useAuth();

  async function doLogout() {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (e: any) {
      console.error('로그아웃 실패:', e);
    }
  }

  async function handleLogout() {
    if (Platform.OS === 'web') {
      const ok = window.confirm('정말 로그아웃 하시겠어요?');
      if (ok) doLogout();
    } else {
      Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', onPress: doLogout },
      ]);
    }
  }

  async function doDeleteAccount() {
    try {
      await deleteAccount();
      router.replace('/(auth)/login');
    } catch {
      if (Platform.OS === 'web') {
        window.alert('다시 시도해주세요.');
      } else {
        Alert.alert('오류', '다시 시도해주세요.');
      }
    }
  }

  function handleDeleteAccount() {
    if (Platform.OS === 'web') {
      const ok = window.confirm('정말 탈퇴하시겠어요?\n모든 데이터가 삭제되며 복구할 수 없습니다.');
      if (ok) doDeleteAccount();
    } else {
      Alert.alert(
        '회원 탈퇴',
        '정말 탈퇴하시겠어요?\n모든 데이터가 삭제되며 복구할 수 없습니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '탈퇴하기', style: 'destructive', onPress: doDeleteAccount },
        ],
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>계정 관리</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>이메일</Text>
          <Text style={styles.infoValue}>{user?.email || '알 수 없음'}</Text>
        </View>

        <MenuList
          items={[
            { id: 'logout', label: '로그아웃', icon: '', onPress: handleLogout },
            { id: 'delete', label: '회원 탈퇴', icon: '', type: 'danger', onPress: handleDeleteAccount },
          ]}
        />

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            회원 탈퇴 시 모든 일기와 프로필 데이터가{'\n'}영구적으로 삭제됩니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 24 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  title: { fontSize: 24, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 20 },
  infoCard: {
    backgroundColor: '#FFFFF8', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8DDD0',
    padding: 16, marginBottom: 20,
  },
  infoLabel: { fontSize: 13, color: '#B0A090', fontFamily: 'Gaegu_400Regular' },
  infoValue: { fontSize: 16, color: '#5D4E3C', fontFamily: 'Gaegu_700Bold', marginTop: 4 },
  notice: {
    marginTop: 16, backgroundColor: '#FFF0F0', borderRadius: 12, padding: 14,
  },
  noticeText: { fontSize: 13, color: '#CC6B5A', fontFamily: 'Gaegu_400Regular', lineHeight: 20, textAlign: 'center' },
});
