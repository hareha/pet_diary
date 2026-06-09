import { supabase } from '@/lib/supabase';
import type { PetProfile, GuardianProfile, UserSettings } from '@/types/user';

// ==========================================
// Pet Profile
// ==========================================
export async function savePetProfile(profile: Partial<PetProfile>): Promise<PetProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const payload = { ...profile, user_id: user.id };

  if (profile.id) {
    const { data, error } = await supabase
      .from('pet_profiles')
      .update(payload)
      .eq('id', profile.id)
      .select()
      .single();
    if (error) throw error;
    return data as PetProfile;
  } else {
    const { data, error } = await supabase
      .from('pet_profiles')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as PetProfile;
  }
}

export async function getPetProfile(): Promise<PetProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('pet_profiles')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error) return null;
  return data as PetProfile;
}

// ==========================================
// Guardian Profile
// ==========================================
export async function saveGuardianProfile(profile: Partial<GuardianProfile>): Promise<GuardianProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const payload = { ...profile, user_id: user.id };

  const { data: existing } = await supabase
    .from('guardian_profiles')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('guardian_profiles')
      .update(payload)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data as GuardianProfile;
  } else {
    const { data, error } = await supabase
      .from('guardian_profiles')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as GuardianProfile;
  }
}

export async function getGuardianProfile(): Promise<GuardianProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('guardian_profiles')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error) return null;
  return data as GuardianProfile;
}

export async function isOnboardingCompleted(): Promise<boolean> {
  const guardian = await getGuardianProfile();
  return guardian?.onboarding_completed ?? false;
}

// ==========================================
// User Settings
// ==========================================
export async function saveUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const payload = { ...settings, user_id: user.id };

  const { data: existing } = await supabase
    .from('user_settings')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(payload)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data as UserSettings;
  } else {
    const { data, error } = await supabase
      .from('user_settings')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as UserSettings;
  }
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error) return null;
  return data as UserSettings;
}

// ==========================================
// Image Upload
// ==========================================
export async function uploadImage(bucket: string, path: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
