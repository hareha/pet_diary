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
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      // @ts-ignore - responseModalities is supported but not yet in all type definitions
      responseModalities: ['IMAGE', 'TEXT'],
    },
  });

  const prompt = `이 사진을 어린이 크레파스 그림일기 스타일로 다시 그려주세요.

규칙:
1. 크레파스(크레용)로 두껍게 색칠한 느낌으로 변환
2. 색감은 따뜻하고 밝은 파스텔톤
3. 선은 굵고 약간 삐뚤빠뚤하게 (어린이가 그린 느낌)
4. 배경도 크레파스로 칠한 느낌으로
5. 사진 속 주요 피사체(동물, 사람 등)의 형태는 유지하되 귀엽게 단순화
6. 스케치북이나 도화지 위에 그린 것처럼 약간의 종이 질감
7. 이미지만 출력하고 텍스트는 포함하지 마세요`;

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
