import type { AiAnalysisResult, ToneType } from './user';

export interface DiaryEntry {
  id?: string;
  user_id?: string;
  pet_id?: string | null;
  date: string; // YYYY-MM-DD
  original_image_url?: string | null;
  styled_image_url?: string | null;
  thumbnail_url?: string | null;
  thumbnail_crop?: { x: number; y: number; width: number; height: number; scale: number } | null;
  image_style: 'original' | 'crayon';
  image_style_target: 'diary' | 'thumbnail' | 'both';
  keywords?: string[];
  diary_text?: string;
  mood?: string;
  weather?: string;
  situation?: string[];
  tone?: ToneType;
  memo?: string | null;
  ai_analysis?: AiAnalysisResult | null;
  created_at?: string;
  updated_at?: string;
}

export interface DiaryComment {
  id?: string;
  diary_id: string;
  user_id?: string;
  content: string;
  created_at?: string;
}

export interface KeywordCategory {
  id: string;
  label: string;
  items: KeywordItem[];
}

export interface KeywordItem {
  id: string;
  label: string;
}
