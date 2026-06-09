import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useWrite } from '@/contexts/write-context';
import ProgressSteps from '@/components/common/ProgressSteps';
import Button from '@/components/common/Button';

const WRITE_STEPS = ['사진', 'AI분석', '상황', '스타일', '썸네일', 'AI일기', '수정'];
const SCREEN_WIDTH = Dimensions.get('window').width;
const PREVIEW_SIZE = Math.min(SCREEN_WIDTH - 48, 320);

export default function PhotoSelectScreen() {
  const { imageUri, setImageUri } = useWrite();

  async function pickFromAlbum() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      if (Platform.OS === 'web') {
        window.alert('카메라 권한이 필요합니다.');
      } else {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
      }
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  function handleNext() {
    if (!imageUri) {
      if (Platform.OS === 'web') {
        window.alert('사진을 선택해주세요.');
      } else {
        Alert.alert('사진 필요', '사진을 선택해주세요.');
      }
      return;
    }
    router.push('/write/ai-analysis');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ProgressSteps steps={WRITE_STEPS} currentStep={0} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>

        <Text style={styles.title}>사진을 선택해주세요</Text>

        {imageUri ? (
          <View style={styles.previewSection}>
            <View style={styles.previewWrap}>
              <Image
                source={{ uri: imageUri }}
                style={styles.preview}
                contentFit="cover"
              />
            </View>
            <TouchableOpacity style={styles.changeBtn} onPress={() => setImageUri(null)}>
              <Text style={styles.changeBtnText}>다른 사진 선택</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.optionContainer}>
            <TouchableOpacity style={styles.optionCard} onPress={pickFromAlbum}>
              <Text style={styles.optionTitle}>앨범에서 가져오기</Text>
              <Text style={styles.optionDesc}>기존 사진에서 선택</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={takePhoto}>
              <Text style={styles.optionTitle}>카메라로 촬영하기</Text>
              <Text style={styles.optionDesc}>지금 바로 촬영</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomArea}>
          {imageUri && (
            <Button title="다음" onPress={handleNext} fullWidth />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  container: { flex: 1, padding: 20 },
  backBtn: { marginTop: 12, marginBottom: 8 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  title: { fontSize: 24, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', textAlign: 'center', marginBottom: 24 },
  previewSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  previewWrap: { alignItems: 'center' },
  preview: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: 16,
    backgroundColor: '#F5EDE4',
  },
  changeBtn: {
    marginTop: 14, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, backgroundColor: '#FFF0E5',
  },
  changeBtnText: { color: '#E88D67', fontFamily: 'Gaegu_700Bold', fontSize: 14 },
  optionContainer: { flex: 1, gap: 16, justifyContent: 'center' },
  optionCard: {
    backgroundColor: '#FFFFF8', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E8DDD0',
    padding: 28, alignItems: 'center',
  },
  optionTitle: { fontSize: 18, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 4 },
  optionDesc: { fontSize: 13, fontFamily: 'Gaegu_400Regular', color: '#B0A090' },
  bottomArea: { paddingTop: 16 },
});
