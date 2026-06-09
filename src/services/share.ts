import { Platform, Share, Alert } from 'react-native';

/**
 * OS 기본 공유 시트를 통한 공유
 */
export async function shareContent(params: {
  message?: string;
  url?: string;
  title?: string;
}) {
  try {
    await Share.share({
      message: params.message || '',
      url: params.url,
      title: params.title,
    });
  } catch (error) {
    Alert.alert('공유 실패', '다시 시도해주세요.');
  }
}

/**
 * 앨범에 이미지 저장
 */
export async function saveToAlbum(imageUri: string) {
  if (Platform.OS === 'web') {
    // 웹에서는 다운로드 링크 생성
    const link = document.createElement('a');
    link.href = imageUri;
    link.download = `diary_${Date.now()}.jpg`;
    link.click();
    return;
  }

  try {
    const MediaLibrary = require('expo-media-library');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 저장하려면 앨범 접근 권한이 필요합니다.');
      return;
    }
    await MediaLibrary.saveToLibraryAsync(imageUri);
    Alert.alert('저장 완료', '앨범에 이미지가 저장되었습니다.');
  } catch (error) {
    Alert.alert('저장 실패', '다시 시도해주세요.');
  }
}

/**
 * 카카오톡 공유 (Share Sheet 경유)
 */
export async function shareToKakao(imageUri: string, text: string) {
  await shareContent({
    message: text,
    url: imageUri,
    title: '우리 아이 일기',
  });
}

/**
 * 인스타그램 공유 (Share Sheet 경유)
 */
export async function shareToInstagram(imageUri: string, text: string) {
  await shareContent({
    message: text,
    url: imageUri,
    title: '우리 아이 일기',
  });
}
