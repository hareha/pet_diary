import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useWrite } from '@/contexts/write-context';
import { analyzeImage } from '@/services/ai-analysis';
import ChipSelector from '@/components/common/ChipSelector';
import Button from '@/components/common/Button';
import ProgressSteps from '@/components/common/ProgressSteps';
import { KEYWORD_CATEGORIES } from '@/constants/keywords';

const WRITE_STEPS = ['사진', 'AI분석', '스타일', '썸네일', 'AI일기', '수정'];

const SITUATION_ITEMS = [
  { id: 'daily', label: '평범한 하루' },
  { id: 'special', label: '특별한 날' },
  { id: 'first', label: '처음 한 일' },
  { id: 'outing', label: '외출/산책' },
  { id: 'rest', label: '휴식/낮잠' },
  { id: 'play', label: '놀이 시간' },
  { id: 'meal', label: '밥/간식' },
  { id: 'health', label: '건강/병원' },
];


export default function AiAnalysisScreen() {
  const {
    imageUri, aiAnalysis, setAiAnalysis,
    situation, setSituation, mood, setMood,
    weather, setWeather, memo, setMemo,
  } = useWrite();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const moodCategory = KEYWORD_CATEGORIES.find((c) => c.id === 'mood');
  const weatherCategory = KEYWORD_CATEGORIES.find((c) => c.id === 'weather');

  useEffect(() => {
    if (imageUri && !aiAnalysis) {
      runAnalysis();
    } else {
      setLoading(false);
    }
  }, []);

  async function runAnalysis() {
    if (!imageUri) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeImage(imageUri);
      setAiAnalysis(result);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('429') || msg.includes('depleted') || msg.includes('RESOURCE_EXHAUSTED')) {
        setError('API 크레딧이 소진되었어요. Google AI Studio에서 크레딧을 충전해주세요.');
      } else if (msg.includes('401') || msg.includes('authentication')) {
        setError('API 키가 유효하지 않아요. 설정을 확인해주세요.');
      } else {
        setError(`AI 분석에 실패했어요: ${msg || '알 수 없는 오류'}`);
      }
    }
    setLoading(false);
  }

  function handleSituationToggle(id: string) {
    setSituation(
      situation.includes(id)
        ? situation.filter((s) => s !== id)
        : [...situation, id],
    );
  }

  const canProceed = situation.length > 0 && mood;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E88D67" />
          <Text style={styles.loadingText}>AI가 사진을 분석하고 있어요...</Text>
          <Text style={styles.loadingSubtext}>반려동물을 찾고 있어요 </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProgressSteps steps={WRITE_STEPS} currentStep={1} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 이전</Text>
        </TouchableOpacity>

        {/* AI 분석 결과 */}
        <Text style={styles.sectionTitle}>AI 분석 결과</Text>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
        )}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="다시 시도" onPress={runAnalysis} variant="secondary" />
          </View>
        ) : aiAnalysis && (
          <View style={styles.resultCard}>
            {aiAnalysis.pet_detected && (
              <ResultRow label="반려동물" value={aiAnalysis.pet_type || '인식됨'} />
            )}
            {aiAnalysis.action && (
              <ResultRow label="행동 / 표정" value={`${aiAnalysis.action}${aiAnalysis.expression ? ` (${aiAnalysis.expression})` : ''}`} />
            )}
            {aiAnalysis.location && (
              <ResultRow label="장소" value={aiAnalysis.location} />
            )}
            {aiAnalysis.background && (
              <ResultRow label="배경" value={aiAnalysis.background} />
            )}
            {aiAnalysis.family_members && aiAnalysis.family_members.length > 0 && (
              <ResultRow label="함께 찍힌 가족" value={aiAnalysis.family_members.join(', ')} />
            )}
          </View>
        )}

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 상황 선택 */}
        <Text style={styles.sectionTitle}>상황을 알려주세요</Text>

        <ChipSelector
          label="오늘 상황"
          items={SITUATION_ITEMS}
          selected={situation}
          onSelect={handleSituationToggle}
          multiple
          required
        />

        {moodCategory && (
          <ChipSelector
            label="기분"
            items={moodCategory.items}
            selected={mood}
            onSelect={setMood}
            required
          />
        )}

        {weatherCategory && (
          <ChipSelector
            label="날씨"
            items={weatherCategory.items}
            selected={weather}
            onSelect={setWeather}
          />
        )}


        <View style={styles.memoSection}>
          <Text style={styles.memoLabel}>한 줄 메모 (선택)</Text>
          <TextInput
            style={styles.memoInput}
            placeholder="오늘 특별히 하고 싶은 말..."
            placeholderTextColor="#C8BDB0"
            value={memo}
            onChangeText={setMemo}
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="다음 →"
          onPress={() => router.push('/write/image-style')}
          fullWidth
          disabled={!canProceed}
        />
      </View>
    </SafeAreaView>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 20, paddingBottom: 100 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 18, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginTop: 20 },
  loadingSubtext: { fontSize: 14, fontFamily: 'Gaegu_400Regular', color: '#B0A090', marginTop: 8 },
  backBtn: { marginTop: 12, marginBottom: 8 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  sectionTitle: {
    fontSize: 22, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C',
    textAlign: 'center', marginBottom: 16, marginTop: 4,
  },
  image: {
    width: '100%', height: 180, borderRadius: 14,
    marginBottom: 12, backgroundColor: '#F5EDE4',
  },

  // AI 분석 결과
  errorCard: {
    backgroundColor: '#FFF0E5', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8A070', padding: 20, alignItems: 'center',
  },
  errorEmoji: { fontSize: 32, marginBottom: 12 },
  errorText: {
    fontSize: 15, color: '#A0522D', fontFamily: 'Gaegu_700Bold',
    textAlign: 'center', lineHeight: 22, marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFF8', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8DDD0', padding: 14, gap: 8,
  },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  resultLabel: {
    fontSize: 12, color: '#B0A090', fontFamily: 'Gaegu_700Bold',
    minWidth: 70,
  },
  resultValue: {
    fontSize: 15, color: '#5D4E3C', fontFamily: 'Gaegu_400Regular',
    flex: 1,
  },

  // 구분선
  divider: {
    height: 1, backgroundColor: '#E8DDD0',
    marginVertical: 20, marginHorizontal: 10,
  },

  // 상황 선택
  memoSection: { marginTop: 8 },
  memoLabel: { fontSize: 15, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 8 },
  memoInput: {
    backgroundColor: '#FFFFF8', borderWidth: 1.5, borderColor: '#E8DDD0',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#5D4E3C',
    fontFamily: 'Gaegu_400Regular', minHeight: 80, textAlignVertical: 'top',
  },
  bottomBar: {
    padding: 16, borderTopWidth: 1, borderTopColor: '#F0E8DD',
    backgroundColor: '#FAF6F0',
  },
});
