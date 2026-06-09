import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AiAnalysisResult, ToneType } from '@/types/user';

interface WriteState {
  imageUri: string | null;
  styledImageUri: string | null;
  aiAnalysis: AiAnalysisResult | null;
  situation: string[];
  mood: string;
  weather: string;
  tone: ToneType;
  memo: string;
  imageStyle: 'original' | 'crayon';
  imageStyleTarget: 'diary' | 'thumbnail' | 'both';
  thumbnailUri: string | null;
  thumbnailCrop: { x: number; y: number; width: number; height: number; scale: number } | null;
  diaryText: string;
  date: string;
}

interface WriteContextType extends WriteState {
  setImageUri: (uri: string | null) => void;
  setStyledImageUri: (uri: string | null) => void;
  setAiAnalysis: (result: AiAnalysisResult | null) => void;
  setSituation: (situation: string[]) => void;
  setMood: (mood: string) => void;
  setWeather: (weather: string) => void;
  setTone: (tone: ToneType) => void;
  setMemo: (memo: string) => void;
  setImageStyle: (style: 'original' | 'crayon') => void;
  setImageStyleTarget: (target: 'diary' | 'thumbnail' | 'both') => void;
  setThumbnailUri: (uri: string | null) => void;
  setThumbnailCrop: (crop: WriteState['thumbnailCrop']) => void;
  setDiaryText: (text: string) => void;
  setDate: (date: string) => void;
  resetAll: () => void;
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const initialState: WriteState = {
  imageUri: null,
  styledImageUri: null,
  aiAnalysis: null,
  situation: [],
  mood: '',
  weather: '',
  tone: 'emotional',
  memo: '',
  imageStyle: 'original',
  imageStyleTarget: 'both',
  thumbnailUri: null,
  thumbnailCrop: null,
  diaryText: '',
  date: getTodayString(),
};

const WriteContext = createContext<WriteContextType>({
  ...initialState,
  setImageUri: () => {},
  setStyledImageUri: () => {},
  setAiAnalysis: () => {},
  setSituation: () => {},
  setMood: () => {},
  setWeather: () => {},
  setTone: () => {},
  setMemo: () => {},
  setImageStyle: () => {},
  setImageStyleTarget: () => {},
  setThumbnailUri: () => {},
  setThumbnailCrop: () => {},
  setDiaryText: () => {},
  setDate: () => {},
  resetAll: () => {},
});

export function WriteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WriteState>(initialState);

  const setField = useCallback(<K extends keyof WriteState>(key: K, value: WriteState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = useCallback(() => {
    setState({ ...initialState, date: getTodayString() });
  }, []);

  return (
    <WriteContext.Provider
      value={{
        ...state,
        setImageUri: (v) => setField('imageUri', v),
        setStyledImageUri: (v) => setField('styledImageUri', v),
        setAiAnalysis: (v) => setField('aiAnalysis', v),
        setSituation: (v) => setField('situation', v),
        setMood: (v) => setField('mood', v),
        setWeather: (v) => setField('weather', v),
        setTone: (v) => setField('tone', v),
        setMemo: (v) => setField('memo', v),
        setImageStyle: (v) => setField('imageStyle', v),
        setImageStyleTarget: (v) => setField('imageStyleTarget', v),
        setThumbnailUri: (v) => setField('thumbnailUri', v),
        setThumbnailCrop: (v) => setField('thumbnailCrop', v),
        setDiaryText: (v) => setField('diaryText', v),
        setDate: (v) => setField('date', v),
        resetAll,
      }}
    >
      {children}
    </WriteContext.Provider>
  );
}

export function useWrite() {
  return useContext(WriteContext);
}
