import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

interface PhotoUploaderProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
}

export default function PhotoUploader({
  imageUri,
  onImageSelected,
}: PhotoUploaderProps) {
  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  }

  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  }

  if (imageUri) {
    return (
      <View style={styles.previewContainer}>
        <View style={styles.previewFrame}>
          <Image
            source={{ uri: imageUri }}
            style={styles.preview}
            contentFit="cover"
          />
        </View>
        <View style={styles.changeRow}>
          <TouchableOpacity style={styles.changeBtn} onPress={pickFromGallery}>
            <Text style={styles.changeBtnText}>다른 사진</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeBtn} onPress={pickFromCamera}>
            <Text style={styles.changeBtnText}>다시 찍기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.uploadContainer}>
      <View style={styles.iconWrap}>
        <Text style={styles.plusIcon}>+</Text>
      </View>
      <Text style={styles.title}>오늘의 사진을 올려주세요</Text>
      <Text style={styles.subtitle}>우리 아이의 하루를 담은 한 장</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickFromGallery}>
          <Text style={styles.btnText}>갤러리</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.uploadBtn, styles.uploadBtnAlt]} onPress={pickFromCamera}>
          <Text style={styles.btnText}>카메라</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8DDD0',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFF8',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5EDE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  plusIcon: {
    fontSize: 28,
    color: '#C8B8A0',
    fontWeight: '300',
    marginTop: -2,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Gaegu_700Bold',
    color: '#5D4E3C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0A090',
    marginBottom: 24,
    fontFamily: 'Gaegu_400Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#E88D67',
  },
  uploadBtnAlt: {
    backgroundColor: '#D4A574',
  },
  btnText: {
    fontSize: 15,
    fontFamily: 'Gaegu_700Bold',
    color: '#FFFFFF',
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewFrame: {
    borderWidth: 2,
    borderColor: '#E8DDD0',
    borderRadius: 16,
    padding: 4,
    backgroundColor: '#FFFFF8',
    marginBottom: 16,
  },
  preview: {
    width: 240,
    height: 240,
    borderRadius: 12,
  },
  changeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  changeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F5EDE4',
    borderWidth: 1,
    borderColor: '#E8DDD0',
  },
  changeBtnText: {
    fontSize: 14,
    color: '#8C7B6B',
    fontFamily: 'Gaegu_700Bold',
  },
});
