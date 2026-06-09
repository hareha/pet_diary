import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChipSelector from '@/components/common/ChipSelector';
import InputField from '@/components/common/InputField';
import DatePicker from '@/components/common/DatePicker';
import Button from '@/components/common/Button';
import ProgressSteps from '@/components/common/ProgressSteps';
import { usePet } from '@/contexts/pet-context';
import type { PetType } from '@/types/user';

const PET_TYPES = [
  { id: '강아지', label: '강아지' },
  { id: '고양이', label: '고양이' },
  { id: '직접입력', label: '직접 입력' },
];

const PERSONALITIES = [
  { id: '활발한', label: '활발한' },
  { id: '차분한', label: '차분한' },
  { id: '겁쟁이', label: '겁쟁이' },
  { id: '호기심왕', label: '호기심왕' },
  { id: '사교적', label: '사교적' },
  { id: '독립적', label: '독립적' },
  { id: '애교쟁이', label: '애교쟁이' },
  { id: '먹보', label: '먹보' },
  { id: '장난꾸러기', label: '장난꾸러기' },
  { id: '느긋한', label: '느긋한' },
  { id: '예민한', label: '예민한' },
  { id: '용감한', label: '용감한' },
];

export default function PetInfoScreen() {
  const { pet, updatePet } = usePet();
  const [petType, setPetType] = useState<PetType>('강아지');
  const [petTypeCustom, setPetTypeCustom] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthUnknown, setBirthUnknown] = useState(false);
  const [ageYears, setAgeYears] = useState('');
  const [personality, setPersonality] = useState<string[]>([]);
  const [customPersonality, setCustomPersonality] = useState('');
  const [loading, setLoading] = useState(false);

  function handlePersonalityToggle(id: string) {
    setPersonality((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function addCustomPersonality() {
    if (customPersonality.trim() && !personality.includes(customPersonality.trim())) {
      setPersonality((prev) => [...prev, customPersonality.trim()]);
      setCustomPersonality('');
    }
  }

  async function handleNext() {
    setLoading(true);
    try {
      await updatePet({
        pet_type: petType,
        pet_type_custom: petType === '직접입력' ? petTypeCustom : null,
        birth_date: birthUnknown ? null : birthDate || null,
        birth_unknown: birthUnknown,
        age_years: birthUnknown ? parseInt(ageYears) || null : null,
        personality,
      });
      router.push('/(onboarding)/guardian-info');
    } catch (error: any) {
      Alert.alert('오류', error.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressSteps steps={['프로필', '정보', '보호자']} currentStep={1} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 이전</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{pet?.name || '반려동물'}의 정보</Text>
        <Text style={styles.subtitle}>더 자세히 알려주세요</Text>

        {/* 유형 선택 */}
        <ChipSelector
          label="반려동물 유형"
          items={PET_TYPES}
          selected={petType}
          onSelect={(id) => setPetType(id as PetType)}
          required
        />
        {petType === '직접입력' && (
          <InputField
            label="직접 입력"
            placeholder="예: 햄스터, 앵무새..."
            value={petTypeCustom}
            onChangeText={setPetTypeCustom}
          />
        )}

        {/* 생년월일 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>생년월일</Text>
          {!birthUnknown ? (
            <DatePicker
              value={birthDate}
              onChange={setBirthDate}
              placeholder="생년월일을 선택해주세요"
              minYear={1990}
            />
          ) : (
            <InputField
              label="나이 (추정)"
              placeholder="숫자만 입력"
              value={ageYears}
              onChangeText={setAgeYears}
              keyboardType="number-pad"
            />
          )}
          <TouchableOpacity
            style={styles.unknownBtn}
            onPress={() => setBirthUnknown(!birthUnknown)}
          >
            <View style={[styles.checkbox, birthUnknown && styles.checkboxChecked]}>
              {birthUnknown && <Text style={styles.checkmark}></Text>}
            </View>
            <Text style={styles.unknownText}>생년월일을 모르겠어요</Text>
          </TouchableOpacity>
        </View>

        {/* 성격 */}
        <ChipSelector
          label="성격 키워드"
          items={PERSONALITIES}
          selected={personality}
          onSelect={handlePersonalityToggle}
          multiple
        />
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            placeholder="직접 입력"
            placeholderTextColor="#C8BDB0"
            value={customPersonality}
            onChangeText={setCustomPersonality}
            onSubmitEditing={addCustomPersonality}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addCustomPersonality}>
            <Text style={styles.addBtnText}>추가</Text>
          </TouchableOpacity>
        </View>

        <Button title="다음" onPress={handleNext} loading={loading} fullWidth style={styles.nextBtn} />
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
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 15, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 8 },
  unknownBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, borderColor: '#E8DDD0',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: { backgroundColor: '#E88D67', borderColor: '#E88D67' },
  checkmark: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  unknownText: { fontSize: 14, color: '#8C7B6B', fontFamily: 'Gaegu_400Regular' },
  customRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  customInput: {
    flex: 1, backgroundColor: '#FFFFF8',
    borderWidth: 1.5, borderColor: '#E8DDD0', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: '#5D4E3C', fontFamily: 'Gaegu_400Regular',
  },
  addBtn: {
    backgroundColor: '#FFF0E5', paddingHorizontal: 16,
    borderRadius: 12, justifyContent: 'center',
  },
  addBtnText: { color: '#E88D67', fontFamily: 'Gaegu_700Bold', fontSize: 14 },
  nextBtn: { marginTop: 16 },
});
