import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paths, File, Directory } from 'expo-file-system';
import type { DiaryEntry } from '@/types/diary';

const DIARY_STORAGE_KEY = 'kyvikos_diaries';
const IMAGE_DIR_NAME = 'diary_images';

function getImageDir(): Directory {
  return new Directory(Paths.document, IMAGE_DIR_NAME);
}

export async function saveImageLocally(uri: string, date: string): Promise<string> {
  const dir = getImageDir();
  if (!dir.exists) {
    dir.create();
  }
  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const filename = `${date}_${Date.now()}.${ext}`;
  const sourceFile = new File(uri);
  const destFile = new File(dir, filename);
  sourceFile.copy(destFile);
  return destFile.uri;
}

async function getAllDiaries(): Promise<Record<string, DiaryEntry>> {
  const raw = await AsyncStorage.getItem(DIARY_STORAGE_KEY);
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, DiaryEntry>;
}

async function setAllDiaries(diaries: Record<string, DiaryEntry>): Promise<void> {
  await AsyncStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(diaries));
}

export async function saveDiaryEntry(entry: DiaryEntry): Promise<void> {
  const diaries = await getAllDiaries();
  diaries[entry.date] = entry;
  await setAllDiaries(diaries);
}

export async function getDiaryEntry(date: string): Promise<DiaryEntry | null> {
  const diaries = await getAllDiaries();
  return diaries[date] ?? null;
}

export async function getDiaryEntriesForMonth(
  year: number,
  month: number,
): Promise<Record<string, DiaryEntry>> {
  const diaries = await getAllDiaries();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const result: Record<string, DiaryEntry> = {};
  for (const [date, entry] of Object.entries(diaries)) {
    if (date.startsWith(prefix)) {
      result[date] = entry;
    }
  }
  return result;
}

export async function deleteDiaryEntry(date: string): Promise<void> {
  const diaries = await getAllDiaries();
  const entry = diaries[date];
  if (entry) {
    // Delete stored images
    try {
      const origFile = new File(entry.originalImageUri);
      if (origFile.exists) origFile.delete();
    } catch {
      // ignore
    }
    if (entry.styledImageUri) {
      try {
        const styledFile = new File(entry.styledImageUri);
        if (styledFile.exists) styledFile.delete();
      } catch {
        // ignore
      }
    }
    delete diaries[date];
    await setAllDiaries(diaries);
  }
}

export async function hasDiaryForDate(date: string): Promise<boolean> {
  const diaries = await getAllDiaries();
  return date in diaries;
}
