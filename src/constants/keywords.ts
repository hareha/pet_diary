import type { KeywordCategory } from '@/types/diary';

export const KEYWORD_CATEGORIES: KeywordCategory[] = [
  {
    id: 'mood',
    label: '오늘의 기분',
    emoji: '',
    items: [
      { id: 'happy', label: '신난', emoji: '' },
      { id: 'sleepy', label: '졸린', emoji: '' },
      { id: 'playful', label: '놀고싶은', emoji: '' },
      { id: 'calm', label: '평온한', emoji: '' },
      { id: 'hungry', label: '배고픈', emoji: '' },
      { id: 'clingy', label: '집사한테 붙고싶은', emoji: '' },
      { id: 'grumpy', label: '삐진', emoji: '' },
      { id: 'curious', label: '궁금한', emoji: '' },
      { id: 'scared', label: '무서운', emoji: '' },
      { id: 'proud', label: '뿌듯한', emoji: '' },
    ],
  },
  {
    id: 'weather',
    label: '날씨',
    emoji: '',
    items: [
      { id: 'sunny', label: '맑음', emoji: '' },
      { id: 'cloudy', label: '흐림', emoji: '' },
      { id: 'rainy', label: '비', emoji: '' },
      { id: 'snowy', label: '눈', emoji: '' },
      { id: 'hot', label: '더움', emoji: '' },
      { id: 'cold', label: '추움', emoji: '' },
    ],
  },
  {
    id: 'activity',
    label: '오늘 한 일',
    emoji: '',
    items: [
      { id: 'walk', label: '산책', emoji: '' },
      { id: 'treat', label: '간식 먹음', emoji: '' },
      { id: 'play', label: '놀았음', emoji: '' },
      { id: 'bath', label: '목욕', emoji: '' },
      { id: 'nap', label: '낮잠', emoji: '' },
      { id: 'vet', label: '병원', emoji: '' },
      { id: 'grooming', label: '미용', emoji: '' },
      { id: 'training', label: '훈련', emoji: '' },
      { id: 'friend', label: '친구 만남', emoji: '' },
      { id: 'car', label: '차 타고 이동', emoji: '' },
      { id: 'cuddling', label: '집사랑 뒹굴', emoji: '' },
      { id: 'watching', label: '창밖 구경', emoji: '' },
      { id: 'toy', label: '장난감 놀이', emoji: '' },
      { id: 'digging', label: '땅 파기', emoji: '' },
    ],
  },
  {
    id: 'food',
    label: '먹은 것',
    emoji: '',
    items: [
      { id: 'kibble', label: '사료', emoji: '' },
      { id: 'wet_food', label: '습식', emoji: '' },
      { id: 'jerky', label: '육포', emoji: '' },
      { id: 'bone', label: '뼈다귀', emoji: '' },
      { id: 'fruit', label: '과일', emoji: '' },
      { id: 'dental', label: '덴탈껌', emoji: '' },
      { id: 'human_food', label: '집사 밥 훔쳐먹음', emoji: '' },
      { id: 'special', label: '특별 간식', emoji: '' },
    ],
  },
];

export const MOOD_KEYWORDS = KEYWORD_CATEGORIES.find((c) => c.id === 'mood')!.items;
export const WEATHER_KEYWORDS = KEYWORD_CATEGORIES.find((c) => c.id === 'weather')!.items;
