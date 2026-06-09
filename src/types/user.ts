export type PetType = '강아지' | '고양이' | '직접입력';
export type GuardianNickname = '엄마' | '아빠' | '집사' | '직접입력';

export interface PetProfile {
  id?: string;
  user_id?: string;
  name: string;
  photo_url?: string | null;
  pet_type: PetType;
  pet_type_custom?: string | null;
  birth_date?: string | null; // YYYY-MM-DD
  birth_unknown: boolean;
  age_years?: number | null;
  personality: string[];
  created_at?: string;
  updated_at?: string;
}

export interface GuardianProfile {
  id?: string;
  user_id?: string;
  nickname: string;
  pet_nickname: string; // 엄마, 아빠, 집사, 직접입력
  pet_nickname_custom?: string | null;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  notification_enabled: boolean;
  notification_time: string; // HH:mm
  auto_login: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ToneType = 'emotional' | 'funny' | 'daily';

export interface AiAnalysisResult {
  pet_detected: boolean;
  pet_type?: string;
  location?: string;
  action?: string;
  expression?: string;
  background?: string;
  mood?: string;
  family_members?: string[];
}
