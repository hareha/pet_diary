export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  originalImageUri: string;
  styledImageUri?: string;
  keywords: string[];
  diaryText: string;
  mood: string;
  weather: string;
  createdAt: string; // ISO timestamp
}

export interface KeywordCategory {
  id: string;
  label: string;
  emoji: string;
  items: KeywordItem[];
}

export interface KeywordItem {
  id: string;
  label: string;
  emoji: string;
}
