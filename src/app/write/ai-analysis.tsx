import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useWrite } from '@/contexts/write-context';
import { analyzeImage } from '@/services/ai-analysis';
import ProgressSteps from '@/components/common/ProgressSteps';
import Button from '@/components/common/Button';

const WRITE_STEPS = ['사진', 'AI분석', '상황', '스타일', '썸네일', 'AI일기', '수정'];

export default function AiAnalysisScreen() {
  const { imageUri, aiAnalysis, setAiAnalysis } = useWrite();
  const [loading, setLoading] = useState(true);

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
    try {
      const result = await analyzeImage(imageUri);
      setAiAnalysis(result);
    } catch {
      // fallback
      setAiAnalysis({
        pet_detected: true,
        pet_type: '반려동물',
        action: '사진 속에 있어요',
        expression: '자연스러운 표정',
        background: '일상 속 한 장면',
      });
    }
    setLoading(false);
  }

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
      <View style={styles.container}>
        <ProgressSteps steps={WRITE_STEPS} currentStep={1} />
        <Text style={styles.title}>AI 분석 결과</Text>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
        )}

        <View style={styles.resultCard}>
          {aiAnalysis?.pet_detected && (
            <ResultRow label="반려동물 인식" value={aiAnalysis.pet_type || '인식됨'} emoji="" />
          )}
          {aiAnalysis?.action && (
            <ResultRow label="행동 / 표정" value={`${aiAnalysis.action}${aiAnalysis.expression ? ` (${aiAnalysis.expression})` : ''}`} emoji="" />
          )}
          {aiAnalysis?.location && (
            <ResultRow label="장소" value={aiAnalysis.location} emoji="" />
          )}
          {aiAnalysis?.background && (
            <ResultRow label="배경 / 분위기" value={aiAnalysis.background} emoji="" />
          )}
          {aiAnalysis?.family_members && aiAnalysis.family_members.length > 0 && (
            <ResultRow label="함께 찍힌 가족" value={aiAnalysis.family_members.join(', ')} emoji="" />
          )}
        </View>

        <View style={styles.buttons}>
          <Button title="다시 분석" onPress={runAnalysis} variant="secondary" style={styles.btn} />
          <Button title="다음 →" onPress={() => router.push('/write/situation')} style={styles.btn} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function ResultRow({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultEmoji}>{emoji}</Text>
      <View style={styles.resultContent}>
        <Text style={styles.resultLabel}>{label}</Text>
        <Text style={styles.resultValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 18, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginTop: 20 },
  loadingSubtext: { fontSize: 14, fontFamily: 'Gaegu_400Regular', color: '#B0A090', marginTop: 8 },
  title: { fontSize: 24, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', textAlign: 'center', marginVertical: 16 },
  image: { width: '100%', height: 180, borderRadius: 14, marginBottom: 16, backgroundColor: '#F5EDE4' },
  resultCard: {
    backgroundColor: '#FFFFF8', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8DDD0', padding: 16, gap: 12,
  },
  resultRow: { flexDirection: 'row', alignItems: 'flex-start' },
  resultEmoji: { fontSize: 18, marginRight: 10, marginTop: 2 },
  resultContent: { flex: 1 },
  resultLabel: { fontSize: 12, color: '#B0A090', fontFamily: 'Gaegu_400Regular' },
  resultValue: { fontSize: 16, color: '#5D4E3C', fontFamily: 'Gaegu_700Bold', marginTop: 2 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btn: { flex: 1 },
});
