import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ProfileAvatar from '@/components/common/ProfileAvatar';
import InputField from '@/components/common/InputField';
import Button from '@/components/common/Button';
import ProgressSteps from '@/components/common/ProgressSteps';
import { usePet } from '@/contexts/pet-context';

export default function PetProfileScreen() {
  const { updatePet } = usePet();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleNext() {
    if (!name.trim()) {
      Alert.alert('이름 필요', '반려동물 이름을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await updatePet({
        name: name.trim(),
        photo_url: photoUri,
        pet_type: '강아지',
        birth_unknown: false,
        personality: [],
      });
      router.push('/(onboarding)/pet-info');
    } catch (error: any) {
      Alert.alert('오류', error.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressSteps steps={['프로필', '정보', '보호자']} currentStep={0} />

        <Text style={styles.title}>반려동물을 소개해주세요!</Text>
        <Text style={styles.subtitle}>사진과 이름을 등록해주세요</Text>

        <View style={styles.avatarSection}>
          <ProfileAvatar
            uri={photoUri}
            size={120}
            editable
            onPress={pickImage}
            placeholder=""
          />
          <Text style={styles.avatarHint}>사진을 눌러 등록해주세요</Text>
        </View>

        <InputField
          label="반려동물 이름"
          placeholder="이름을 입력해주세요"
          value={name}
          onChangeText={setName}
          required
        />

        <Button
          title="다음"
          onPress={handleNext}
          loading={loading}
          fullWidth
          disabled={!name.trim()}
          style={styles.nextBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 24, paddingTop: 16 },
  title: { fontSize: 26, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', textAlign: 'center', marginTop: 24 },
  subtitle: { fontSize: 15, fontFamily: 'Gaegu_400Regular', color: '#B0A090', textAlign: 'center', marginTop: 4, marginBottom: 28 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarHint: { fontSize: 13, color: '#B0A090', fontFamily: 'Gaegu_400Regular', marginTop: 8 },
  nextBtn: { marginTop: 16 },
});
