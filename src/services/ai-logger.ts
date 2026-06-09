import { supabase } from '@/lib/supabase';

type LogType = 'image_analysis' | 'diary_generate' | 'diary_regenerate';

/**
 * AI 로그를 Supabase에 저장
 */
export async function saveAiLog(params: {
  type: LogType;
  input: Record<string, any>;
  output: Record<string, any> | string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const outputData = typeof params.output === 'string'
      ? { text: params.output }
      : params.output;

    await supabase.from('ai_logs').insert({
      user_id: user.id,
      type: params.type,
      input: params.input,
      output: outputData,
    });
  } catch (error) {
    // 로깅 실패는 무시 (디버깅용이므로 앱 동작에 영향 X)
    console.warn('AI 로그 저장 실패:', error);
  }
}
