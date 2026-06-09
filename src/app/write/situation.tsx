import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWrite } from '@/contexts/write-context';
import ChipSelector from '@/components/common/ChipSelector';
import Button from '@/components/common/Button';
import ProgressSteps from '@/components/common/ProgressSteps';
import { KEYWORD_CATEGORIES } from '@/constants/keywords';

const WRITE_STEPS = ['사진', 'AI분석', '상황', '스타일', '썸네일', 'AI일기', '수정'];

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

const TONE_ITEMS = [
  { id: 'emotional', label: '감성글' },
  { id: 'funny', label: '웃긴글' },
  { id: 'daily', label: '일상글' },
];

export default function SituationScreen() {
  const { situation, setSituation, mood, setMood, weather, setWeather, tone, setTone, memo, setMemo } = useWrite();
  const moodCategory = KEYWORD_CATEGORIES.find((c) => c.id === 'mood');
  const weatherCategory = KEYWORD_CATEGORIES.find((c) => c.id === 'weather');

  function handleSituationToggle(id: string) {
    setSituation(
      situation.includes(id)
        ? situation.filter((s) => s !== id)
        : [...situation, id],
    );
  }

  const canProceed = situation.length > 0 && mood && tone;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressSteps steps={WRITE_STEPS} currentStep={2} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 이전</Text>
        </TouchableOpacity>

        <Text style={styles.title}>상황을 알려주세요</Text>

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

        <ChipSelector
          label="글 톤"
          items={TONE_ITEMS}
          selected={tone}
          onSelect={(id) => setTone(id as any)}
          required
        />

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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 20, paddingBottom: 100 },
  backBtn: { marginTop: 12, marginBottom: 8 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  title: { fontSize: 24, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', textAlign: 'center', marginBottom: 20 },
  memoSection: { marginTop: 8 },
  memoLabel: { fontSize: 15, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 8 },
  memoInput: {
    backgroundColor: '#FFFFF8', borderWidth: 1.5, borderColor: '#E8DDD0',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#5D4E3C',
    fontFamily: 'Gaegu_400Regular', minHeight: 80, textAlignVertical: 'top',
  },
  bottomBar: { padding: 16, borderTopWidth: 1, borderTopColor: '#F0E8DD', backgroundColor: '#FAF6F0' },
});
