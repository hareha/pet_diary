import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useWrite } from '@/contexts/write-context';
import Button from '@/components/common/Button';
import ProgressSteps from '@/components/common/ProgressSteps';

const WRITE_STEPS = ['사진', 'AI분석', '스타일', '썸네일', 'AI일기', '수정'];

export default function ThumbnailScreen() {
  const { imageUri, thumbnailUri, setThumbnailUri } = useWrite();
  const displayUri = thumbnailUri || imageUri;

  async function pickDifferentPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setThumbnailUri(result.assets[0].uri);
    }
  }

  function useOriginal() {
    setThumbnailUri(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressSteps steps={WRITE_STEPS} currentStep={3} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 이전</Text>
        </TouchableOpacity>

        <Text style={styles.title}>캘린더 썸네일</Text>
        <Text style={styles.subtitle}>캘린더에 보여질 썸네일을 설정해주세요</Text>

        {/* 썸네일 미리보기 */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>미리보기</Text>
          <View style={styles.calendarPreview}>
            <View style={styles.dayCell}>
              {displayUri && (
                <Image source={{ uri: displayUri }} style={styles.thumbnailImage} contentFit="cover" />
              )}
              <Text style={styles.dayNumber}>15</Text>
            </View>
          </View>
        </View>

        {/* 옵션 */}
        <View style={styles.optionContainer}>
          <TouchableOpacity
            style={[styles.optionCard, !thumbnailUri && styles.optionSelected]}
            onPress={useOriginal}
          >
            <Text style={styles.optionTitle}>일기 이미지 그대로</Text>
            <Text style={styles.optionDesc}>사진 원본을 썸네일로 사용</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, !!thumbnailUri && styles.optionSelected]}
            onPress={pickDifferentPhoto}
          >
            <Text style={styles.optionTitle}>다른 사진으로 변경</Text>
            <Text style={styles.optionDesc}>앨범에서 선택 또는 카메라 촬영</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.decorateNotice}>
          <Text style={styles.decorateText}>
            썸네일 꾸미기 (크레용 편집, 텍스트 추가)는{'\n'}추후 업데이트 예정입니다
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button title="다음 →" onPress={() => router.push('/write/ai-diary')} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 20, paddingBottom: 100 },
  backBtn: { marginTop: 12, marginBottom: 8 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  title: { fontSize: 24, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Gaegu_400Regular', color: '#B0A090', textAlign: 'center', marginBottom: 20 },
  previewSection: { alignItems: 'center', marginBottom: 24 },
  previewTitle: { fontSize: 13, color: '#B0A090', fontFamily: 'Gaegu_400Regular', marginBottom: 8 },
  calendarPreview: {
    backgroundColor: '#FFFFF8', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8DDD0', padding: 12,
  },
  dayCell: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  thumbnailImage: { width: 80, height: 80 },
  dayNumber: {
    position: 'absolute', top: 4, left: 6,
    fontSize: 12, fontWeight: '700', color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2,
    textShadowOffset: { width: 0, height: 1 },
  },
  optionContainer: { gap: 12 },
  optionCard: {
    backgroundColor: '#FFFFF8', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8DDD0', padding: 16,
  },
  optionSelected: { borderColor: '#E88D67', backgroundColor: '#FFF0E5' },
  optionTitle: { fontSize: 16, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 4 },
  optionDesc: { fontSize: 13, fontFamily: 'Gaegu_400Regular', color: '#B0A090' },
  decorateNotice: {
    marginTop: 16, backgroundColor: '#F5EDE4', borderRadius: 12, padding: 14,
  },
  decorateText: { fontSize: 13, color: '#8C7B6B', fontFamily: 'Gaegu_400Regular', textAlign: 'center', lineHeight: 20 },
  bottomBar: { padding: 16, borderTopWidth: 1, borderTopColor: '#F0E8DD', backgroundColor: '#FAF6F0' },
});
