import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputField from '@/components/common/InputField';
import ChipSelector from '@/components/common/ChipSelector';
import Button from '@/components/common/Button';
import ProgressSteps from '@/components/common/ProgressSteps';
import { usePet } from '@/contexts/pet-context';

const PET_NICKNAMES = [
  { id: '엄마', label: '엄마' },
  { id: '아빠', label: '아빠' },
  { id: '집사', label: '집사' },
  { id: '직접입력', label: '직접 입력' },
];

export default function GuardianInfoScreen() {
  const { pet, updateGuardian } = usePet();
  const [nickname, setNickname] = useState('');
  const [petNickname, setPetNickname] = useState('집사');
  const [petNicknameCustom, setPetNicknameCustom] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    if (!nickname.trim()) {
      Alert.alert('닉네임 필요', '닉네임을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await updateGuardian({
        nickname: nickname.trim(),
        pet_nickname: petNickname,
        pet_nickname_custom: petNickname === '직접입력' ? petNicknameCustom : null,
        onboarding_completed: true,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('오류', error.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressSteps steps={['프로필', '정보', '보호자']} currentStep={2} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 이전</Text>
        </TouchableOpacity>

        <Text style={styles.title}>보호자 정보</Text>
        <Text style={styles.subtitle}>{pet?.name || '반려동물'}이 당신을 뭐라고 부를까요?</Text>

        <InputField
          label="닉네임"
          placeholder="닉네임을 입력해주세요"
          value={nickname}
          onChangeText={setNickname}
          required
        />

        <ChipSelector
          label="애칭 (반려동물이 부르는 호칭)"
          items={PET_NICKNAMES}
          selected={petNickname}
          onSelect={setPetNickname}
          required
        />

        {petNickname === '직접입력' && (
          <InputField
            label="직접 입력"
            placeholder="예: 누나, 형, 오빠..."
            value={petNicknameCustom}
            onChangeText={setPetNicknameCustom}
          />
        )}

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>미리보기</Text>
          <Text style={styles.previewText}>
            "{pet?.name || '반려동물'}의 {petNickname === '직접입력' ? (petNicknameCustom || '???') : petNickname}, {nickname || '???'}에게"
          </Text>
        </View>

        <Button
          title="시작하기 "
          onPress={handleComplete}
          loading={loading}
          fullWidth
          disabled={!nickname.trim()}
          style={styles.completeBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 24, paddingTop: 16, paddingBottom: 40 },
  backBtn: { marginTop: 12, marginBottom: 8 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  title: { fontSize: 26, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 4 },
  subtitle: { fontSize: 15, fontFamily: 'Gaegu_400Regular', color: '#B0A090', marginBottom: 24 },
  previewCard: {
    backgroundColor: '#FFFFF8', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8DDD0',
    padding: 16, marginTop: 8, marginBottom: 20, alignItems: 'center',
  },
  previewTitle: { fontSize: 13, color: '#B0A090', fontFamily: 'Gaegu_400Regular', marginBottom: 8 },
  previewText: { fontSize: 18, color: '#5D4E3C', fontFamily: 'Gaegu_700Bold', textAlign: 'center' },
  completeBtn: { marginTop: 8 },
});
