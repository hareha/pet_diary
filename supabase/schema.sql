-- ============================================
-- 반려동물 일기 앱 - Supabase DB Schema
-- ============================================

-- 1. 반려동물 프로필
CREATE TABLE IF NOT EXISTS pet_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  pet_type TEXT NOT NULL DEFAULT '강아지', -- 강아지, 고양이, 직접입력
  pet_type_custom TEXT, -- pet_type이 직접입력일 때
  birth_date DATE,
  birth_unknown BOOLEAN DEFAULT FALSE,
  age_years INTEGER, -- 생년월일 모를 때 나이만
  personality TEXT[] DEFAULT '{}', -- 성격 키워드 배열
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 보호자 프로필
CREATE TABLE IF NOT EXISTS guardian_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  pet_nickname TEXT NOT NULL DEFAULT '집사', -- 엄마, 아빠, 집사, 직접입력
  pet_nickname_custom TEXT, -- 직접입력일 때
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. 일기 엔트리
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pet_profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  original_image_url TEXT,
  styled_image_url TEXT,
  thumbnail_url TEXT,
  thumbnail_crop JSONB, -- {x, y, width, height, scale}
  image_style TEXT DEFAULT 'original', -- original, crayon
  image_style_target TEXT DEFAULT 'both', -- diary, thumbnail, both
  diary_text TEXT,
  mood TEXT,
  weather TEXT,
  situation TEXT[] DEFAULT '{}',
  tone TEXT DEFAULT 'emotional', -- emotional, funny, daily
  memo TEXT,
  ai_analysis JSONB, -- AI 분석 결과 저장
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 4. 댓글
CREATE TABLE IF NOT EXISTS diary_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diary_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 사용자 설정
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  notification_time TIME DEFAULT '20:00',
  auto_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================

ALTER TABLE pet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- pet_profiles: 본인만 CRUD
CREATE POLICY "Users can manage own pet profiles"
  ON pet_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- guardian_profiles: 본인만 CRUD
CREATE POLICY "Users can manage own guardian profile"
  ON guardian_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- diary_entries: 본인만 CRUD
CREATE POLICY "Users can manage own diary entries"
  ON diary_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- diary_comments: 본인만 CRUD
CREATE POLICY "Users can manage own comments"
  ON diary_comments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_settings: 본인만 CRUD
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Storage Bucket
-- ============================================
-- 이미지 저장을 위한 스토리지 버킷 (Supabase Dashboard에서 생성 필요)
-- bucket: 'diary-images'
-- bucket: 'profile-images'

-- ============================================
-- Updated_at 자동 갱신 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pet_profiles_updated_at
  BEFORE UPDATE ON pet_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guardian_profiles_updated_at
  BEFORE UPDATE ON guardian_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON diary_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
