import { supabase } from '@/lib/supabase';

export interface DiaryEntryDB {
  id?: string;
  user_id?: string;
  pet_id?: string | null;
  date: string;
  original_image_url?: string | null;
  styled_image_url?: string | null;
  thumbnail_url?: string | null;
  thumbnail_crop?: any | null;
  image_style: string;
  image_style_target: string;
  diary_text: string;
  mood?: string | null;
  weather?: string | null;
  situation?: string[];
  tone?: string | null;
  memo?: string | null;
  ai_analysis?: any | null;
  keywords?: string[];
  created_at?: string;
  updated_at?: string;
}

async function getUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

async function requireUserId(): Promise<string> {
  const id = await getUserId();
  if (!id) throw new Error('로그인이 필요합니다.');
  return id;
}

export async function saveDiaryEntry(entry: {
  date: string;
  originalImageUri?: string;
  styledImageUri?: string | null;
  thumbnailUri?: string | null;
  thumbnailCrop?: any;
  imageStyle?: string;
  imageStyleTarget?: string;
  diaryText: string;
  mood?: string;
  weather?: string;
  situation?: string[];
  tone?: string;
  memo?: string;
  aiAnalysis?: any;
  keywords?: string[];
}): Promise<void> {
  const userId = await requireUserId();

  const row: any = {
    user_id: userId,
    date: entry.date,
    original_image_url: entry.originalImageUri || null,
    styled_image_url: entry.styledImageUri || null,
    thumbnail_url: entry.thumbnailUri || null,
    thumbnail_crop: entry.thumbnailCrop || null,
    image_style: entry.imageStyle || 'original',
    image_style_target: entry.imageStyleTarget || 'both',
    diary_text: entry.diaryText,
    mood: entry.mood || null,
    weather: entry.weather || null,
    situation: entry.situation || [],
    tone: entry.tone || 'emotional',
    memo: entry.memo || null,
    ai_analysis: entry.aiAnalysis || null,
    keywords: entry.keywords || [],
  };

  const { error } = await supabase
    .from('diary_entries')
    .upsert(row, { onConflict: 'user_id,date' });

  if (error) {
    console.error('일기 저장 에러:', error);
    throw new Error(`일기 저장 실패: ${error.message}`);
  }
}

export async function getDiaryEntry(date: string): Promise<DiaryEntryDB | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  if (error) {
    console.error('일기 조회 에러:', error);
    return null;
  }

  return data;
}

export async function getDiaryEntriesForMonth(
  year: number,
  month: number,
): Promise<Record<string, DiaryEntryDB>> {
  const userId = await getUserId();
  if (!userId) return {};

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('월별 조회 에러:', error);
    return {};
  }

  const result: Record<string, DiaryEntryDB> = {};
  for (const entry of data || []) {
    result[entry.date] = entry;
  }
  return result;
}

export async function deleteDiaryEntry(date: string): Promise<void> {
  const userId = await requireUserId();

  const { error } = await supabase
    .from('diary_entries')
    .delete()
    .eq('user_id', userId)
    .eq('date', date);

  if (error) {
    console.error('일기 삭제 에러:', error);
    throw new Error(`일기 삭제 실패: ${error.message}`);
  }
}

export async function hasDiaryForDate(date: string): Promise<boolean> {
  const userId = await getUserId();

  const { count, error } = await supabase
    .from('diary_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('date', date);

  if (error) return false;
  return (count ?? 0) > 0;
}
