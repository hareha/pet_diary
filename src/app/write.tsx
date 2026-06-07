import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhotoUploader from '@/components/diary/PhotoUploader';
import KeywordSelector from '@/components/diary/KeywordSelector';
import DiaryPage from '@/components/diary/DiaryPage';
import { generateDiary } from '@/services/diary-generator';
import { saveDiaryEntry, saveImageLocally, hasDiaryForDate } from '@/services/storage';
import type { DiaryEntry } from '@/types/diary';

type Step = 'photo' | 'keywords' | 'result';

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function WriteScreen() {
  const [step, setStep] = useState<Step>('photo');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedWeather, setSelectedWeather] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [diaryText, setDiaryText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleKeyword = useCallback(
    (categoryId: string, keywordId: string) => {
      if (categoryId === 'mood') {
        setSelectedMood((prev) => (prev === keywordId ? '' : keywordId));
      } else if (categoryId === 'weather') {
        setSelectedWeather((prev) => (prev === keywordId ? '' : keywordId));
      } else {
        setSelectedKeywords((prev) =>
          prev.includes(keywordId)
            ? prev.filter((k) => k !== keywordId)
            : [...prev, keywordId],
        );
      }
    },
    [],
  );

  async function handleGenerate() {
    if (!selectedMood || !selectedWeather) {
      Alert.alert('필수 선택', '기분과 날씨를 선택해주세요!');
      return;
    }

    setIsGenerating(true);
    // Small delay for animation feel
    await new Promise((r) => setTimeout(r, 800));

    const text = generateDiary(selectedKeywords, selectedMood, selectedWeather);
    setDiaryText(text);
    setIsGenerating(false);
    setStep('result');
  }

  async function handleSave() {
    if (!imageUri) return;

    const today = getTodayString();
    const exists = await hasDiaryForDate(today);
    if (exists) {
      Alert.alert(
        '이미 작성됨',
        '오늘의 일기가 이미 있어요. 덮어쓸까요?',
        [
          { text: '취소', style: 'cancel' },
          { text: '덮어쓰기', onPress: () => doSave(today) },
        ],
      );
      return;
    }
    await doSave(today);
  }

  async function doSave(date: string) {
    setIsSaving(true);
    try {
      const savedImageUri = await saveImageLocally(imageUri!, date);
      const entry: DiaryEntry = {
        id: `diary_${date}_${Date.now()}`,
        date,
        originalImageUri: savedImageUri,
        keywords: [...selectedKeywords],
        diaryText,
        mood: selectedMood,
        weather: selectedWeather,
        createdAt: new Date().toISOString(),
      };
      await saveDiaryEntry(entry);
      Alert.alert('저장 완료', '오늘의 반려동물 일기가 저장되었어요.', [
        { text: '확인', onPress: () => router.replace('/') },
      ]);
    } catch (e) {
      Alert.alert('저장 실패', '다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleRegenerate() {
    const text = generateDiary(selectedKeywords, selectedMood, selectedWeather);
    setDiaryText(text);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>오늘의 반려동물 일기</Text>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step === 'photo' && styles.activeStep]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step === 'keywords' && styles.activeStep]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step === 'result' && styles.activeStep]} />
          </View>
          <View style={styles.stepLabels}>
            <Text style={[styles.stepLabel, step === 'photo' && styles.activeStepLabel]}>
              사진
            </Text>
            <Text
              style={[styles.stepLabel, step === 'keywords' && styles.activeStepLabel]}
            >
              키워드
            </Text>
            <Text
              style={[styles.stepLabel, step === 'result' && styles.activeStepLabel]}
            >
              완성
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {step === 'photo' && (
            <View style={styles.stepContent}>
              <PhotoUploader
                imageUri={imageUri}
                onImageSelected={setImageUri}
              />
              {imageUri && (
                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={() => setStep('keywords')}
                >
                  <Text style={styles.nextBtnText}>다음 →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {step === 'keywords' && (
            <View style={styles.stepContent}>
              <KeywordSelector
                selectedKeywords={selectedKeywords}
                selectedMood={selectedMood}
                selectedWeather={selectedWeather}
                onToggleKeyword={handleToggleKeyword}
              />
            </View>
          )}

          {step === 'result' && (
            <View style={styles.stepContent}>
              {isGenerating ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color="#E88D67" />
                  <Text style={styles.loadingText}>일기를 쓰고 있어요...</Text>
                </View>
              ) : (
                <View style={styles.resultWrap}>
                  <DiaryPage
                    date={getTodayString()}
                    weather={selectedWeather}
                    mood={selectedMood}
                    imageUri={imageUri!}
                    diaryText={diaryText}
                    keywords={selectedKeywords}
                  />
                  <View style={styles.resultActions}>
                    <TouchableOpacity
                      style={styles.regenerateBtn}
                      onPress={handleRegenerate}
                    >
                      <Text style={styles.regenerateBtnText}>다시 쓰기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                      onPress={handleSave}
                      disabled={isSaving}
                    >
                      <Text style={styles.saveBtnText}>
                        {isSaving ? '저장 중...' : '저장하기'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom buttons for keywords step */}
        {step === 'keywords' && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setStep('photo')}
            >
              <Text style={styles.backBtnText}>이전</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.generateBtn,
                (!selectedMood || !selectedWeather) && styles.generateBtnDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!selectedMood || !selectedWeather || isGenerating}
            >
              <Text style={styles.generateBtnText}>
                {isGenerating ? '생성 중...' : '일기 만들기'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF6F0',
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EDE4',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Gaegu_700Bold',
    color: '#5D4E3C',
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E8DDD0',
  },
  activeStep: {
    backgroundColor: '#E88D67',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E8DDD0',
    marginHorizontal: 4,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
  },
  stepLabel: {
    fontSize: 11,
    color: '#B0A090',
    fontWeight: '500',
    textAlign: 'center',
    width: 50,
  },
  activeStepLabel: {
    color: '#E88D67',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContent: {
    flex: 1,
  },
  nextBtn: {
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: '#E88D67',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5EDE4',
    backgroundColor: '#FAF6F0',
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F5EDE4',
  },
  backBtnText: {
    color: '#8C7B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  generateBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#E88D67',
    alignItems: 'center',
  },
  generateBtnDisabled: {
    backgroundColor: '#E8DDD0',
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#8C7B6B',
    fontFamily: 'Gaegu_400Regular',
  },
  resultWrap: {
    alignItems: 'center',
  },
  diaryTextWrap: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#FFFBF7',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0E4D8',
    width: '100%',
  },
  diaryTextContent: {
    fontSize: 15,
    color: '#5D4E3C',
    lineHeight: 26,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  regenerateBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFF0E5',
    alignItems: 'center',
  },
  regenerateBtnText: {
    color: '#E88D67',
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#E88D67',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
