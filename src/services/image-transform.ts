import { GoogleGenerativeAI } from '@google/generative-ai';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Gemini AI를 사용해 사진을 크레파스 그림일기 스타일로 변환
 */
export async function transformToCrayon(imageUri: string): Promise<string> {
  const { base64, mimeType } = await imageToBase64(imageUri);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image',
    generationConfig: {
      // @ts-ignore - responseModalities is supported but not yet in all type definitions
      responseModalities: ['IMAGE', 'TEXT'],
    },
  });

  const prompt = `이 사진을 6~7세 어린이가 크레파스로 그린 것 같은 그림일기로 완전히 새로 그려주세요.

[스타일 규칙]
- 매우 서툴고 단순한 그림. 사실적이면 안 됨
- 인물/동물: 큰 머리 + 작은 몸, 점 눈 + 웃는 입, 팔다리는 막대기처럼 단순하게
- 크레파스 특유의 삐뚤빠뚤한 굵은 선, 색칠은 선 밖으로 나가도 됨
- 명암 없음, 디테일 없음, 원근감 없음
- 원본 사진의 색상을 그대로 쓰지 말고, 밝고 선명한 크레파스 색상(빨강, 노랑, 파랑, 초록, 분홍) 사용

[배경]
- 흰 종이(도화지) 배경
- 해, 구름, 꽃, 하트, 별, 무지개 등 어린이가 좋아하는 단순한 장식 요소 추가
- 하늘은 파란 크레파스로 대충 칠한 느낌

[중요]
- 사진에 필터를 씌우는 것이 아니라, 어린이가 이 사진을 보고 따라 그린 것처럼 완전히 새로운 그림을 그려야 함
- 글자나 텍스트는 절대 포함하지 마세요
- 이미지만 출력하세요`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64, mimeType } },
  ]);

  // 응답에서 이미지 추출
  const response = result.response;
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('AI가 이미지를 생성하지 못했습니다.');
  }

  const parts = candidates[0].content.parts;
  for (const part of parts) {
    if (part.inlineData) {
      const imgMime = part.inlineData.mimeType || 'image/png';
      const imgData = part.inlineData.data;
      return `data:${imgMime};base64,${imgData}`;
    }
  }

  throw new Error('AI 응답에서 이미지를 찾을 수 없습니다.');
}

/**
 * 이미지 URI를 base64로 변환
 */
async function imageToBase64(imageUri: string): Promise<{ base64: string; mimeType: string }> {
  if (Platform.OS === 'web') {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1]!;
        const mimeType = dataUrl.split(';')[0]!.split(':')[1]!;
        resolve({ base64, mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpeg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    return { base64, mimeType };
  }
}
