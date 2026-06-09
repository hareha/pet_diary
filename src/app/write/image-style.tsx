import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useWrite } from '@/contexts/write-context';
import ChipSelector from '@/components/common/ChipSelector';
import Button from '@/components/common/Button';
import ProgressSteps from '@/components/common/ProgressSteps';
import { transformToCrayon } from '@/services/image-transform';

const WRITE_STEPS = ['사진', 'AI분석', '상황', '스타일', '썸네일', 'AI일기', '수정'];
const PREVIEW_SIZE = Math.min(Dimensions.get('window').width - 48, 280);

const STYLE_ITEMS = [
  { id: 'original', label: '원본 사진' },
  { id: 'crayon', label: '크레파스 드로잉' },
];

const TARGET_ITEMS = [
  { id: 'diary', label: '일기 이미지만' },
  { id: 'thumbnail', label: '캘린더 썸네일만' },
  { id: 'both', label: '둘 다 적용' },
];

export default function ImageStyleScreen() {
  const { imageUri, styledImageUri, setStyledImageUri, imageStyle, setImageStyle, imageStyleTarget, setImageStyleTarget } = useWrite();
  const [transforming, setTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStyleChange(styleId: string) {
    setImageStyle(styleId as any);
    setError(null);

    if (styleId === 'crayon' && !styledImageUri && imageUri) {
      setTransforming(true);
      try {
        const result = await transformToCrayon(imageUri);
        setStyledImageUri(result);
      } catch (err: any) {
        console.error('변환 실패:', err);
        setError(err.message || '이미지 변환에 실패했습니다.');
        setImageStyle('original');
      } finally {
        setTransforming(false);
      }
    }
  }

  async function handleRetry() {
    if (!imageUri) return;
    setError(null);
    setTransforming(true);
    try {
      const result = await transformToCrayon(imageUri);
      setStyledImageUri(result);
      setImageStyle('crayon');
    } catch (err: any) {
      setError(err.message || '이미지 변환에 실패했습니다.');
    } finally {
      setTransforming(false);
    }
  }

  const displayUri = imageStyle === 'crayon' && styledImageUri ? styledImageUri : imageUri;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressSteps steps={WRITE_STEPS} currentStep={3} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 이전</Text>
        </TouchableOpacity>

        <Text style={styles.title}>이미지 스타일</Text>

        {/* 미리보기 */}
        <View style={styles.previewContainer}>
          {transforming ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#E88D67" />
              <Text style={styles.loadingText}>크레파스 드로잉으로 변환 중...</Text>
              <Text style={styles.loadingSubtext}>30초 정도 걸릴 수 있어요</Text>
            </View>
          ) : displayUri ? (
            <View style={styles.previewWrap}>
              <Image
                source={{ uri: displayUri }}
                style={styles.previewImage}
                contentFit="cover"
              />
              <Text style={styles.previewLabel}>
                {imageStyle === 'original' ? '원본' : '크레파스 드로잉'}
              </Text>
            </View>
          ) : null}
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryBtnText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 원본/크레파스 비교 (변환 완료 시) */}
        {styledImageUri && !transforming && (
          <View style={styles.compareRow}>
            <TouchableOpacity
              style={[styles.compareCard, imageStyle === 'original' && styles.compareCardActive]}
              onPress={() => setImageStyle('original')}
            >
              <Image source={{ uri: imageUri! }} style={styles.compareImage} contentFit="cover" />
              <Text style={styles.compareLabel}>원본</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.compareCard, imageStyle === 'crayon' && styles.compareCardActive]}
              onPress={() => setImageStyle('crayon')}
            >
              <Image source={{ uri: styledImageUri }} style={styles.compareImage} contentFit="cover" />
              <Text style={styles.compareLabel}>크레파스</Text>
            </TouchableOpacity>
          </View>
        )}

        {!styledImageUri && !transforming && (
          <ChipSelector
            label="스타일 선택"
            items={STYLE_ITEMS}
            selected={imageStyle}
            onSelect={handleStyleChange}
          />
        )}

        <ChipSelector
          label="적용 위치"
          items={TARGET_ITEMS}
          selected={imageStyleTarget}
          onSelect={(id) => setImageStyleTarget(id as any)}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="다음"
          onPress={() => router.push('/write/thumbnail')}
          fullWidth
          disabled={transforming}
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

  previewContainer: { marginBottom: 20, alignItems: 'center' },
  previewWrap: { alignItems: 'center' },
  previewImage: { width: PREVIEW_SIZE, height: PREVIEW_SIZE, borderRadius: 16, backgroundColor: '#F5EDE4' },
  previewLabel: { fontSize: 14, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginTop: 8 },

  loadingWrap: {
    width: PREVIEW_SIZE, height: PREVIEW_SIZE,
    borderRadius: 16, backgroundColor: '#FFF8F2',
    borderWidth: 1.5, borderColor: '#E8DDD0', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  loadingText: { fontSize: 15, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginTop: 14 },
  loadingSubtext: { fontSize: 13, fontFamily: 'Gaegu_400Regular', color: '#B0A090', marginTop: 4 },

  errorBox: {
    backgroundColor: '#FFF0E5', borderRadius: 12, padding: 14,
    marginBottom: 16, alignItems: 'center',
  },
  errorText: { fontSize: 13, color: '#D06030', fontFamily: 'Gaegu_400Regular', textAlign: 'center', marginBottom: 10 },
  retryBtn: { backgroundColor: '#E88D67', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 },
  retryBtnText: { color: '#FFF', fontFamily: 'Gaegu_700Bold', fontSize: 14 },

  compareRow: { flexDirection: 'row', gap: 12, marginBottom: 20, justifyContent: 'center' },
  compareCard: {
    borderRadius: 12, borderWidth: 2, borderColor: '#E8DDD0',
    overflow: 'hidden', alignItems: 'center', paddingBottom: 8,
  },
  compareCardActive: { borderColor: '#E88D67' },
  compareImage: { width: (PREVIEW_SIZE - 12) / 2, height: (PREVIEW_SIZE - 12) / 2, borderRadius: 10 },
  compareLabel: { fontSize: 13, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginTop: 6 },

  bottomBar: { padding: 16, borderTopWidth: 1, borderTopColor: '#F0E8DD', backgroundColor: '#FAF6F0' },
});
