import { GoogleGenerativeAI } from '@google/generative-ai';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import type { AiAnalysisResult } from '@/types/user';
import { saveAiLog } from './ai-logger';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

/**
 * 모델 fallback + 재시도
 */
async function runWithFallback(
  fn: (modelName: string) => Promise<any>,
  maxRetries = 2,
): Promise<any> {
  for (const model of MODELS) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn(model);
      } catch (error: any) {
        const is503 = error.message?.includes('503') || error.message?.includes('high demand') || error.message?.includes('overloaded');
        const isRetryable = is503 || error.message?.includes('429');
        if (isRetryable && attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        if (isRetryable && MODELS.indexOf(model) < MODELS.length - 1) {
          console.warn(`${model} 실패, fallback 모델 시도...`);
          break; // 다음 모델로
        }
        throw error;
      }
    }
  }
  throw new Error('모든 AI 모델이 응답하지 않습니다. 잠시 후 다시 시도해주세요.');
}

/**
 * 이미지 URI를 base64로 변환
 */
async function imageToBase64(imageUri: string): Promise<{ base64: string; mimeType: string }> {
  if (Platform.OS === 'web') {
    // 웹: fetch로 blob → base64
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
    // 네이티브: expo-file-system
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpeg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    return { base64, mimeType };
  }
}

/**
 * AI 이미지 분석 (Gemini 2.5 Flash)
 */
export async function analyzeImage(imageUri: string): Promise<AiAnalysisResult> {
  try {
    const { base64, mimeType } = await imageToBase64(imageUri);

    const result = await runWithFallback(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `이 사진을 분석해주세요. 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "pet_detected": true/false,
  "pet_type": "강아지/고양이/기타 동물종류",
  "location": "장소 설명 (예: 거실, 공원, 카페)",
  "action": "동물이 하고 있는 행동 (예: 낮잠 자고 있다, 공을 물고 있다)",
  "expression": "동물의 표정/상태 (예: 졸린 표정, 신난 눈빛)",
  "background": "배경 묘사 (예: 햇살이 들어오는 창가)",
  "mood": "전체적인 분위기 (예: 평화로운, 활기찬, 나른한)",
  "family_members": ["사진에 함께 찍힌 사람들 (예: 보호자)"]
}

반려동물이 없는 사진이면 pet_detected를 false로 하고 나머지도 사진 내용에 맞게 채워주세요.`;

      return model.generateContent([
        prompt,
        { inlineData: { data: base64, mimeType } },
      ]);
    });

    const text = result.response.text();
    // JSON 추출 (```json ... ``` 또는 순수 JSON)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const analysisResult: AiAnalysisResult = {
      pet_detected: parsed.pet_detected ?? true,
      pet_type: parsed.pet_type,
      location: parsed.location,
      action: parsed.action,
      expression: parsed.expression,
      background: parsed.background,
      mood: parsed.mood,
      family_members: parsed.family_members ?? [],
    };

    // 디버그 로그 저장
    saveAiLog({
      type: 'image_analysis',
      input: { imageUri: imageUri.substring(0, 100) },
      output: analysisResult,
    });

    return analysisResult;
  } catch (error: any) {
    console.error('AI 분석 실패:', error);
    throw new Error(`이미지 분석에 실패했습니다: ${error.message}`);
  }
}

/**
 * AI 일기 생성 (Gemini 2.5 Flash)
 */
export async function generateAiDiary(params: {
  aiAnalysis: AiAnalysisResult | null;
  situation: string[];
  mood: string;
  tone: string;
  memo?: string;
  petName?: string;
  guardianNickname?: string;
  recentDiaries?: string[];
}): Promise<string> {
  try {
    const { aiAnalysis, situation, mood, tone, memo, petName, guardianNickname, recentDiaries } = params;

    const name = petName || '나';
    const guardian = guardianNickname || '집사';

    const toneGuide: Record<string, string> = {
      emotional: `감성적이고 따뜻한 톤. ${name}이(가) ${guardian}를 얼마나 사랑하는지, 일상의 소소한 행복을 섬세하게 표현. 마지막은 따뜻한 여운이 남도록.`,
      funny: `웃기고 엉뚱한 톤. ${name}이(가) 자기만의 세계관으로 상황을 해석. 과장, 억울함, 당당함을 섞어서. "ㅋㅋ", "ㅎㅎ" 같은 표현도 자연스럽게 사용.`,
      daily: `담백하고 일상적인 톤. ${name}이(가) 짧고 간결하게 하루를 기록. 군더더기 없이 핵심만.`,
    };

    const prompt = `당신은 반려동물 "${name}"입니다. ${name}의 시점에서 오늘 하루 일기를 쓰세요.

[톤/스타일]
${toneGuide[tone] || toneGuide.emotional}

[오늘의 상황]
- 장소: ${aiAnalysis?.location || '알 수 없음'}
- 하고 있던 일: ${aiAnalysis?.action || '알 수 없음'}
- 표정/상태: ${aiAnalysis?.expression || '알 수 없음'}
- 분위기: ${aiAnalysis?.background || '알 수 없음'}
- 기분: ${mood || aiAnalysis?.mood || '보통'}
- 상황 키워드: ${situation.length > 0 ? situation.join(', ') : '없음'}
${memo ? `- 보호자 메모: ${memo}` : ''}
- 보호자 호칭: ${guardian}
${aiAnalysis?.family_members && aiAnalysis.family_members.length > 0 ? `- 함께한 사람: ${aiAnalysis.family_members.join(', ')}` : ''}

[규칙]
1. 반드시 ${name}의 1인칭 시점으로 작성
2. 200~350자 내외
3. 동물 특유의 관점으로 상황을 재해석 (사람이 쓰는 것처럼 쓰면 안 됨)
4. 감정과 오감(냄새, 소리, 촉감)을 살려서 생동감 있게
5. ${guardian}에 대한 언급을 자연스럽게 포함
6. 제목이나 날짜 없이 본문만 작성
${recentDiaries && recentDiaries.length > 0 ? `7. 최근 일기와 비슷한 표현 피하기. 최근 일기: ${recentDiaries.slice(0, 2).join(' | ')}` : ''}

일기 본문만 출력하세요:`;

    const genResult = await runWithFallback(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });
      return model.generateContent(prompt);
    });
    const text = genResult.response.text().trim();

    if (!text || text.length < 20) {
      throw new Error('생성된 일기가 너무 짧습니다.');
    }

    // 디버그 로그 저장
    saveAiLog({
      type: 'diary_generate',
      input: { petName, guardianNickname, tone, mood, situation, memo, aiAnalysis },
      output: text,
    });

    return text;
  } catch (error: any) {
    console.error('AI 일기 생성 실패:', error);
    throw new Error(`일기 생성에 실패했습니다: ${error.message}`);
  }
}

/**
 * AI 일기 재생성 (톤 변경)
 */
export async function regenerateWithTone(
  originalParams: Parameters<typeof generateAiDiary>[0],
  newTone: string,
): Promise<string> {
  const result = await generateAiDiary({ ...originalParams, tone: newTone });

  // 재생성 로그 (diary_generate와 별도로 기록)
  saveAiLog({
    type: 'diary_regenerate',
    input: { ...originalParams, tone: newTone },
    output: result,
  });

  return result;
}
