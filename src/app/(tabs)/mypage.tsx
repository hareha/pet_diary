import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileAvatar from '@/components/common/ProfileAvatar';
import MenuList from '@/components/common/MenuList';
import Button from '@/components/common/Button';
import { usePet } from '@/contexts/pet-context';
import { useAuth } from '@/contexts/auth-context';
import { signOut } from '@/services/auth';

export default function MyPageTab() {
  const { pet, guardian, refreshProfiles } = usePet();
  const { user } = useAuth();

  useEffect(() => {
    refreshProfiles();
  }, []);

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

  const displayNickname = guardian?.pet_nickname === '직접입력'
    ? guardian.pet_nickname_custom
    : guardian?.pet_nickname;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>마이페이지</Text>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <ProfileAvatar uri={pet?.photo_url} size={80} />
          <Text style={styles.petName}>{pet?.name || '반려동물'}</Text>
          <Text style={styles.petInfo}>
            {pet?.pet_type === '직접입력' ? pet.pet_type_custom : pet?.pet_type}
            {pet?.personality && pet.personality.length > 0 && ` · ${pet.personality.slice(0, 3).join(', ')}`}
          </Text>
          <View style={styles.guardianRow}>
            <Text style={styles.guardianText}>
              {displayNickname || '보호자'} {guardian?.nickname || ''}
            </Text>
          </View>
        </View>

        {/* 반려동물 관리 */}
        <MenuList
          title="반려동물"
          items={[
            { id: 'pet-edit', label: '프로필 수정', icon: '', subtitle: '사진, 이름, 유형, 생년월일, 성격', onPress: () => router.push('/mypage/pet-edit') },
          ]}
        />

        {/* 보호자 관리 */}
        <MenuList
          title="보호자"
          items={[
            { id: 'guardian-edit', label: '정보 수정', icon: '', subtitle: '닉네임, 애칭', onPress: () => router.push('/mypage/guardian-edit') },
          ]}
        />

        {/* 설정 */}
        <MenuList
          title="설정"
          items={[
            { id: 'notifications', label: '알림 설정', icon: '', onPress: () => router.push('/mypage/notifications') },
            { id: 'account', label: '계정 관리', icon: '', subtitle: user?.email, onPress: () => router.push('/mypage/account') },
            { id: 'logout', label: '로그아웃', icon: '', type: 'danger', onPress: handleLogout },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 28, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', textAlign: 'center', marginBottom: 20 },
  profileCard: {
    backgroundColor: '#FFFFF8', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E8DDD0',
    padding: 24, alignItems: 'center', marginBottom: 24,
  },
  petName: { fontSize: 24, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginTop: 12 },
  petInfo: { fontSize: 14, fontFamily: 'Gaegu_400Regular', color: '#B0A090', marginTop: 4 },
  guardianRow: {
    marginTop: 12, backgroundColor: '#FFF0E5', paddingHorizontal: 16,
    paddingVertical: 6, borderRadius: 20,
  },
  guardianText: { fontSize: 14, fontFamily: 'Gaegu_700Bold', color: '#E88D67' },
});
