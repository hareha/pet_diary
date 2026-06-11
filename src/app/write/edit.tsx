import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useWrite } from '@/contexts/write-context';
import { usePet } from '@/contexts/pet-context';
import { generateAiDiary } from '@/services/ai-analysis';
import { saveDiaryEntry } from '@/services/storage';
import { uploadDiaryImage } from '@/services/image-upload';
import ChipSelector from '@/components/common/ChipSelector';
import Button from '@/components/common/Button';
import ProgressSteps from '@/components/common/ProgressSteps';

const WRITE_STEPS = ['사진', 'AI분석', '스타일', '썸네일', 'AI일기', '수정'];


export default function EditScreen() {
  const write = useWrite();
  const { pet, guardian } = usePet();
  const [editText, setEditText] = useState(write.diaryText);
  const [editMemo, setEditMemo] = useState(write.memo);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const guardianNickname = guardian?.pet_nickname === '직접입력'
        ? guardian.pet_nickname_custom || '집사'
        : guardian?.pet_nickname || '집사';

      const text = await generateAiDiary({
        aiAnalysis: write.aiAnalysis,
        situation: write.situation,
        mood: write.mood,
        memo: editMemo,
        petName: pet?.name,
        guardianNickname,
      });
      setEditText(text);
    } catch {
      // ignore
    }
    setRegenerating(false);
  }

  async function handleSave() {
    if (!write.imageUri) return;
    setSaving(true);
    try {
      // 1. 이미지 업로드
      const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const originalUrl = await uploadDiaryImage(write.imageUri, user.id, write.date, 'original');
      
      let styledUrl: string | null = null;
      if (write.styledImageUri) {
        styledUrl = await uploadDiaryImage(write.styledImageUri, user.id, write.date, 'styled');
      }

      // 2. DB에 저장
      await saveDiaryEntry({
        date: write.date,
        originalImageUri: originalUrl,
        styledImageUri: styledUrl,
        thumbnailUri: originalUrl,
        thumbnailCrop: write.thumbnailCrop,
        imageStyle: write.imageStyle,
        imageStyleTarget: write.imageStyleTarget,
        diaryText: editText,
        mood: write.mood,
        weather: write.weather,
        situation: write.situation,
        tone: 'cute-serious',
        memo: editMemo,
        aiAnalysis: write.aiAnalysis,
        keywords: write.situation,
      });
      write.resetAll();
      router.replace(`/diary/complete?date=${write.date}`);
    } catch (e: any) {
      console.error('저장 실패:', e);
      if (Platform.OS === 'web') {
        window.alert(e.message || '저장에 실패했습니다.');
      } else {
        Alert.alert('저장 실패', e.message || '다시 시도해주세요.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressSteps steps={WRITE_STEPS} currentStep={5} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 이전</Text>
        </TouchableOpacity>

        <Text style={styles.title}>일기 수정</Text>

        {/* 이미지 미리보기 */}
        {write.imageUri && (
          <Image source={{ uri: write.imageUri }} style={styles.previewImage} contentFit="cover" />
        )}

        {/* 재생성 */}
        <TouchableOpacity
          style={styles.regenBtn}
          onPress={handleRegenerate}
          disabled={regenerating}
        >
          <Text style={styles.regenBtnText}>
            {regenerating ? '재생성 중...' : '🔄 다시 쓰기'}
          </Text>
        </TouchableOpacity>

        {/* 문장 수정 */}
        <Text style={styles.sectionLabel}>일기 내용</Text>
        <TextInput
          style={styles.diaryInput}
          value={editText}
          onChangeText={setEditText}
          multiline
          placeholder="일기를 수정해주세요..."
          placeholderTextColor="#C8BDB0"
        />

        {/* 한 줄 메모 수정 */}
        <Text style={styles.sectionLabel}>한 줄 메모</Text>
        <TextInput
          style={styles.memoInput}
          value={editMemo}
          onChangeText={setEditMemo}
          placeholder="메모 수정..."
          placeholderTextColor="#C8BDB0"
        />

        <View style={styles.actions}>
          <Button
            title="문장 다시 생성"
            onPress={() => handleRegenerateWithTone(editTone)}
            variant="secondary"
            loading={regenerating}
            style={styles.btn}
          />
          <Button
            title="저장하기"
            onPress={handleSave}
            loading={saving}
            style={styles.btn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { marginTop: 12, marginBottom: 8 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  title: { fontSize: 24, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', textAlign: 'center', marginBottom: 16 },
  previewImage: { width: '100%', height: 200, borderRadius: 14, marginBottom: 20, backgroundColor: '#F5EDE4' },
  sectionLabel: { fontSize: 15, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 8 },
  diaryInput: {
    backgroundColor: '#FFFFF8', borderWidth: 1.5, borderColor: '#E8DDD0',
    borderRadius: 12, padding: 14, fontSize: 16, color: '#5D4E3C',
    fontFamily: 'YoonManSeh', minHeight: 150, textAlignVertical: 'top',
    marginBottom: 16, lineHeight: 26,
  },
  memoInput: {
    backgroundColor: '#FFFFF8', borderWidth: 1.5, borderColor: '#E8DDD0',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#5D4E3C',
    fontFamily: 'Gaegu_400Regular', marginBottom: 20,
  },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1 },
  regenBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFF0E5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  regenBtnText: {
    color: '#E88D67',
    fontFamily: 'Gaegu_700Bold',
    fontSize: 14,
  },
});
