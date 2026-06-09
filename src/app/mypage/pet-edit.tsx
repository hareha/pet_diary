import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ProfileAvatar from '@/components/common/ProfileAvatar';
import InputField from '@/components/common/InputField';
import DatePicker from '@/components/common/DatePicker';
import ChipSelector from '@/components/common/ChipSelector';
import Button from '@/components/common/Button';
import { usePet } from '@/contexts/pet-context';
import type { PetType } from '@/types/user';

const PET_TYPES = [
  { id: '강아지', label: '강아지' },
  { id: '고양이', label: '고양이' },
  { id: '직접입력', label: '직접 입력' },
];

const PERSONALITIES = [
  { id: '활발한', label: '활발한' }, { id: '차분한', label: '차분한' },
  { id: '겁쟁이', label: '겁쟁이' }, { id: '호기심왕', label: '호기심왕' },
  { id: '사교적', label: '사교적' }, { id: '독립적', label: '독립적' },
  { id: '애교쟁이', label: '애교쟁이' }, { id: '먹보', label: '먹보' },
  { id: '장난꾸러기', label: '장난꾸러기' }, { id: '느긋한', label: '느긋한' },
  { id: '예민한', label: '예민한' }, { id: '용감한', label: '용감한' },
];

export default function PetEditScreen() {
  const { pet, updatePet } = usePet();
  const [photoUri, setPhotoUri] = useState<string | null>(pet?.photo_url ?? null);
  const [name, setName] = useState(pet?.name ?? '');
  const [petType, setPetType] = useState<PetType>(pet?.pet_type ?? '강아지');
  const [petTypeCustom, setPetTypeCustom] = useState(pet?.pet_type_custom ?? '');
  const [birthDate, setBirthDate] = useState(pet?.birth_date ?? '');
  const [birthUnknown, setBirthUnknown] = useState(pet?.birth_unknown ?? false);
  const [ageYears, setAgeYears] = useState(String(pet?.age_years ?? ''));
  const [personality, setPersonality] = useState<string[]>(pet?.personality ?? []);
  const [saving, setSaving] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  }

  function handlePersonalityToggle(id: string) {
    setPersonality((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('이름 필요', '반려동물 이름을 입력해주세요.'); return; }
    setSaving(true);
    try {
      await updatePet({
        name: name.trim(), photo_url: photoUri, pet_type: petType,
        pet_type_custom: petType === '직접입력' ? petTypeCustom : null,
        birth_date: birthUnknown ? null : birthDate || null,
        birth_unknown: birthUnknown,
        age_years: birthUnknown ? parseInt(ageYears) || null : null,
        personality,
      });
      Alert.alert('저장 완료', '프로필이 수정되었어요.', [{ text: '확인', onPress: () => router.back() }]);
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
        <Text style={styles.title}>반려동물 프로필 수정</Text>

        <ProfileAvatar uri={photoUri} size={100} editable onPress={pickImage} />
        <View style={styles.spacer} />

        <InputField label="이름" value={name} onChangeText={setName} required />
        <ChipSelector label="유형" items={PET_TYPES} selected={petType} onSelect={(id) => setPetType(id as PetType)} />
        {petType === '직접입력' && <InputField label="직접 입력" value={petTypeCustom} onChangeText={setPetTypeCustom} />}

        {!birthUnknown ? (
          <DatePicker label="생년월일" value={birthDate} onChange={setBirthDate} minYear={1990} />
        ) : (
          <InputField label="나이 (추정)" value={ageYears} onChangeText={setAgeYears} keyboardType="number-pad" />
        )}
        <TouchableOpacity style={styles.unknownBtn} onPress={() => setBirthUnknown(!birthUnknown)}>
          <View style={[styles.checkbox, birthUnknown && styles.checkboxChecked]}>
            {birthUnknown && <Text style={styles.checkmark}></Text>}
          </View>
          <Text style={styles.unknownText}>생년월일을 모르겠어요</Text>
        </TouchableOpacity>

        <ChipSelector label="성격" items={PERSONALITIES} selected={personality} onSelect={handlePersonalityToggle} multiple />

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
  spacer: { height: 20 },
  unknownBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: '#E8DDD0',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  checkboxChecked: { backgroundColor: '#E88D67', borderColor: '#E88D67' },
  checkmark: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  unknownText: { fontSize: 14, color: '#8C7B6B', fontFamily: 'Gaegu_400Regular' },
  saveBtn: { marginTop: 20 },
});
