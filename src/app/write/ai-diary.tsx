import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWrite } from '@/contexts/write-context';
import { usePet } from '@/contexts/pet-context';
import { generateAiDiary } from '@/services/ai-analysis';
import Button from '@/components/common/Button';
import ProgressSteps from '@/components/common/ProgressSteps';

const WRITE_STEPS = ['사진', 'AI분석', '상황', '스타일', '썸네일', 'AI일기', '수정'];

export default function AiDiaryScreen() {
  const write = useWrite();
  const { pet, guardian } = usePet();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!write.diaryText) {
      generateDiary();
    } else {
      setLoading(false);
    }
  }, []);

  async function generateDiary() {
    setLoading(true);
    try {
      const guardianNickname = guardian?.pet_nickname === '직접입력'
        ? guardian.pet_nickname_custom || '집사'
        : guardian?.pet_nickname || '집사';

      const text = await generateAiDiary({
        aiAnalysis: write.aiAnalysis,
        situation: write.situation,
        mood: write.mood,
        tone: write.tone,
        memo: write.memo,
        petName: pet?.name,
        guardianNickname,
      });
      write.setDiaryText(text);
    } catch {
      write.setDiaryText('오늘도 좋은 하루였다. 집사와 함께해서 행복했다.');
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E88D67" />
          <Text style={styles.loadingText}>AI가 일기를 쓰고 있어요...</Text>
          <Text style={styles.loadingSubtext}>
            {pet?.name || '반려동물'} 시점으로 작성 중           </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressSteps steps={WRITE_STEPS} currentStep={5} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 이전</Text>
        </TouchableOpacity>

        <Text style={styles.title}>AI 일기 완성!</Text>

        <View style={styles.diaryCard}>
          <Text style={styles.toneLabel}>
            {write.tone === 'emotional' ? '감성글' : write.tone === 'funny' ? '웃긴글' : '일상글'}
          </Text>
          <Text style={styles.diaryText}>{write.diaryText}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>반려동물 시점으로 작성됨</Text>
          <Text style={styles.infoLabel}>가족 관계 맥락 반영</Text>
          <Text style={styles.infoLabel}>최근 일기 중복 표현 방지</Text>
        </View>

        <View style={styles.actions}>
          <Button title="다시 생성" onPress={generateDiary} variant="secondary" style={styles.btn} />
          <Button title="수정하기 →" onPress={() => router.push('/write/edit')} style={styles.btn} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 18, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginTop: 20 },
  loadingSubtext: { fontSize: 14, fontFamily: 'Gaegu_400Regular', color: '#B0A090', marginTop: 8 },
  backBtn: { marginTop: 12, marginBottom: 8 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  title: { fontSize: 24, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', textAlign: 'center', marginBottom: 20 },
  diaryCard: {
    backgroundColor: '#FFFFF8', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E8DDD0', padding: 20,
  },
  toneLabel: {
    fontSize: 13, color: '#E88D67', fontFamily: 'Gaegu_700Bold',
    backgroundColor: '#FFF0E5', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12,
  },
  diaryText: { fontSize: 17, color: '#5D4E3C', fontFamily: 'Gaegu_400Regular', lineHeight: 28 },
  infoRow: { marginTop: 16, gap: 6 },
  infoLabel: { fontSize: 13, color: '#B0A090', fontFamily: 'Gaegu_400Regular' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btn: { flex: 1 },
});
