const { Client } = require('pg');

const client = new Client({
  host: '2406:da12:557:f802:5b35:de2c:1764:33e6',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'kyvikos31986!',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('✅ Connected to Supabase DB');

  const queries = [
    // 1. pet_profiles
    `CREATE TABLE IF NOT EXISTS pet_profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      photo_url TEXT,
      pet_type TEXT NOT NULL DEFAULT '강아지',
      pet_type_custom TEXT,
      birth_date DATE,
      birth_unknown BOOLEAN DEFAULT FALSE,
      age_years INTEGER,
      personality TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // 2. guardian_profiles
    `CREATE TABLE IF NOT EXISTS guardian_profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      nickname TEXT NOT NULL,
      pet_nickname TEXT NOT NULL DEFAULT '집사',
      pet_nickname_custom TEXT,
      onboarding_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id)
    )`,

    // 3. diary_entries
    `CREATE TABLE IF NOT EXISTS diary_entries (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      pet_id UUID REFERENCES pet_profiles(id) ON DELETE SET NULL,
      date DATE NOT NULL,
      original_image_url TEXT,
      styled_image_url TEXT,
      thumbnail_url TEXT,
      thumbnail_crop JSONB,
      image_style TEXT DEFAULT 'original',
      image_style_target TEXT DEFAULT 'both',
      diary_text TEXT,
      mood TEXT,
      weather TEXT,
      situation TEXT[] DEFAULT '{}',
      tone TEXT DEFAULT 'emotional',
      memo TEXT,
      ai_analysis JSONB,
      keywords TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, date)
    )`,

    // 4. diary_comments
    `CREATE TABLE IF NOT EXISTS diary_comments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      diary_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // 5. user_settings
    `CREATE TABLE IF NOT EXISTS user_settings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      notification_enabled BOOLEAN DEFAULT TRUE,
      notification_time TIME DEFAULT '20:00',
      auto_login BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id)
    )`,

    // RLS 활성화
    `ALTER TABLE pet_profiles ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE guardian_profiles ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE diary_comments ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY`,

    // RLS 정책 - pet_profiles
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own pet profiles') THEN
        CREATE POLICY "Users can manage own pet profiles" ON pet_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      END IF;
    END $$`,

    // RLS 정책 - guardian_profiles
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own guardian profile') THEN
        CREATE POLICY "Users can manage own guardian profile" ON guardian_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      END IF;
    END $$`,

    // RLS 정책 - diary_entries
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own diary entries') THEN
        CREATE POLICY "Users can manage own diary entries" ON diary_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      END IF;
    END $$`,

    // RLS 정책 - diary_comments
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own comments') THEN
        CREATE POLICY "Users can manage own comments" ON diary_comments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      END IF;
    END $$`,

    // RLS 정책 - user_settings
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own settings') THEN
        CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      END IF;
    END $$`,

    // updated_at 자동 갱신 트리거 함수
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql`,

    // 트리거들
    `DROP TRIGGER IF EXISTS update_pet_profiles_updated_at ON pet_profiles;
    CREATE TRIGGER update_pet_profiles_updated_at
      BEFORE UPDATE ON pet_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

    `DROP TRIGGER IF EXISTS update_guardian_profiles_updated_at ON guardian_profiles;
    CREATE TRIGGER update_guardian_profiles_updated_at
      BEFORE UPDATE ON guardian_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

    `DROP TRIGGER IF EXISTS update_diary_entries_updated_at ON diary_entries;
    CREATE TRIGGER update_diary_entries_updated_at
      BEFORE UPDATE ON diary_entries
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

    `DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
    CREATE TRIGGER update_user_settings_updated_at
      BEFORE UPDATE ON user_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
  ];

  for (let i = 0; i < queries.length; i++) {
    try {
      await client.query(queries[i]);
      console.log(`✅ [${i + 1}/${queries.length}] 완료`);
    } catch (err) {
      console.error(`❌ [${i + 1}/${queries.length}] 에러:`, err.message);
    }
  }

  // 테이블 확인
  const result = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  console.log('\n📋 생성된 테이블 목록:');
  result.rows.forEach(r => console.log(`  - ${r.table_name}`));

  await client.end();
  console.log('\n✅ DB 설정 완료!');
}

run().catch(err => {
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});
