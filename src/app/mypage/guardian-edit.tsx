import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputField from '@/components/common/InputField';
import ChipSelector from '@/components/common/ChipSelector';
import Button from '@/components/common/Button';
import { usePet } from '@/contexts/pet-context';

const PET_NICKNAMES = [
  { id: '엄마', label: '엄마' },
  { id: '아빠', label: '아빠' },
  { id: '집사', label: '집사' },
  { id: '직접입력', label: '직접 입력' },
];

export default function GuardianEditScreen() {
  const { guardian, updateGuardian } = usePet();
  const [nickname, setNickname] = useState(guardian?.nickname ?? '');
  const [petNickname, setPetNickname] = useState(guardian?.pet_nickname ?? '집사');
  const [petNicknameCustom, setPetNicknameCustom] = useState(guardian?.pet_nickname_custom ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!nickname.trim()) { Alert.alert('닉네임 필요'); return; }
    setSaving(true);
    try {
      await updateGuardian({
        nickname: nickname.trim(),
        pet_nickname: petNickname,
        pet_nickname_custom: petNickname === '직접입력' ? petNicknameCustom : null,
      });
      Alert.alert('저장 완료', '보호자 정보가 수정되었어요.', [{ text: '확인', onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '다시 시도해주세요.');
    } finally { setSaving(false); }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>보호자 정보 수정</Text>

        <InputField label="닉네임" value={nickname} onChangeText={setNickname} required />
        <ChipSelector label="애칭" items={PET_NICKNAMES} selected={petNickname} onSelect={setPetNickname} />
        {petNickname === '직접입력' && (
          <InputField label="직접 입력" value={petNicknameCustom} onChangeText={setPetNicknameCustom} />
        )}

        <Button title="저장하기" onPress={handleSave} loading={saving} fullWidth style={styles.saveBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  title: { fontSize: 24, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 20 },
  saveBtn: { marginTop: 20 },
});
