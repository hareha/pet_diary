import { KEYWORD_CATEGORIES } from '@/constants/keywords';

/**
 * Phase 1: 키워드 기반 템플릿 일기 생성 (반려동물 1인칭 시점)
 * Phase 2: Gemini API로 교체 예정
 */

const DIARY_TEMPLATES = [
  '오늘은 {weather} 날이었다. {activities} {mood} 하루였다멍. {ending}',
  '{weather} 하늘 아래, {activities} {mood} 기분이었다. {ending}',
  '집사가 일어나자마자 나를 봤다. {weather} 날씨에 {activities} {mood} 하루를 보냈다. {ending}',
  '오늘의 일기를 쓴다. {weather} 날에 {activities} 정말 {mood}! {ending}',
  '{weather} 오늘, {activities} 나는 {mood} 기분이다. {ending}',
  '멍멍! 오늘도 좋은 날이다. {weather} 날씨 속에서 {activities} {mood} 느낌이었다. {ending}',
];

const MOOD_PHRASES: Record<string, string[]> = {
  happy: ['신나는', '즐거운', '꼬리가 쉴 새 없이 흔들린', '행복한'],
  sleepy: ['졸린', '눈이 자꾸 감기는', '나른한', '꾸벅꾸벅한'],
  playful: ['놀고 싶어 미칠 것 같은', '에너지 넘치는', '신나서 뛰어다닌'],
  calm: ['평온한', '차분한', '편안한', '느긋한'],
  hungry: ['배고픈', '밥 달라고 짖고 싶은', '뱃속이 꼬르륵거리는'],
  clingy: ['집사한테 딱 붙어있고 싶은', '혼자 있기 싫은', '집사 무릎이 그리운'],
  grumpy: ['삐진', '기분 나쁜', '심통 난', '집사한테 토라진'],
  curious: ['궁금한 게 많은', '여기저기 킁킁거린', '뭐든 탐색하고 싶은'],
  scared: ['무서운', '꼬리를 내린', '집사 뒤에 숨은', '벌벌 떤'],
  proud: ['뿌듯한', '잘했다고 칭찬받은', '으쓱한', '자랑스러운'],
};

const WEATHER_PHRASES: Record<string, string[]> = {
  sunny: ['햇살 좋은', '맑은', '따뜻한 햇빛이 내리쬐는'],
  cloudy: ['흐린', '구름 낀', '해가 안 보이는'],
  rainy: ['비 오는', '축축한', '빗소리가 들리는'],
  snowy: ['눈 내리는', '하얀 세상인', '발이 시려운'],
  hot: ['더운', '혀를 내밀고 헥헥거린', '그늘을 찾아다닌'],
  cold: ['추운', '이불 속에 파고든', '몸을 웅크린'],
};

const ACTIVITY_PHRASES: Record<string, string[]> = {
  walk: ['집사랑 산책을 갔다.', '밖에 나가서 냄새를 실컷 맡았다.', '동네를 한 바퀴 돌았다.'],
  treat: ['맛있는 간식을 받아먹었다.', '집사가 간식을 줬는데 너무 맛있었다.'],
  play: ['집사랑 신나게 놀았다.', '이리저리 뛰어다니며 놀았다.'],
  bath: ['물에 들어갔다... 목욕이었다.', '온몸이 젖었다. 목욕 싫다.', '깨끗해졌다. 목욕 후에 간식을 받았다.'],
  nap: ['햇볕 쬐며 꿀잠을 잤다.', '소파에서 코를 골며 잤다.', '집사 옆에서 낮잠을 잤다.'],
  vet: ['병원에 갔다. 무서웠다.', '병원 냄새가 나서 긴장했다.', '수의사 선생님을 만났다.'],
  grooming: ['미용을 했다. 이뻐졌다.', '털을 깎았다. 시원하다.'],
  training: ['집사가 뭘 가르쳐줬다.', '앉아, 기다려를 했더니 간식을 줬다.'],
  friend: ['다른 친구를 만났다!', '친구랑 엉덩이 냄새를 맡았다.', '동네 친구를 만나서 같이 놀았다.'],
  car: ['차를 탔다. 창문 밖 바람이 좋았다.', '드라이브를 했다!'],
  cuddling: ['집사 품에서 뒹굴거렸다.', '집사가 배를 쓸어줬다. 최고다.', '집사 무릎에 올라갔다.'],
  watching: ['창밖을 구경했다. 새가 날아다녔다.', '창문 앞에 앉아서 밖을 봤다.'],
  toy: ['장난감을 물고 다녔다.', '공놀이를 했다!', '삑삑이를 신나게 물었다.'],
  digging: ['땅을 팠다. 뭔가 있을 것 같았다.', '이불을 파고들었다.'],
};

const FOOD_PHRASES: Record<string, string[]> = {
  kibble: ['밥을 맛있게 먹었다.', '사료를 뚝딱 비웠다.'],
  wet_food: ['습식 사료를 먹었다. 평소보다 맛있었다!'],
  jerky: ['육포를 받았다! 쫄깃쫄깃했다.'],
  bone: ['뼈다귀를 오래오래 씹었다.', '뼈다귀 최고!'],
  fruit: ['과일을 받아먹었다. 달았다.'],
  dental: ['덴탈껌을 씹었다. 이빨이 시원하다.'],
  human_food: ['집사 밥에서 뭔가 떨어졌는데 얼른 주워먹었다.', '집사 먹는 거 쳐다봤더니 한 입 줬다!'],
  special: ['특별한 간식을 받았다! 오늘 무슨 날인가?'],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function getKeywordLabel(keywordId: string): string {
  for (const cat of KEYWORD_CATEGORIES) {
    const item = cat.items.find((i) => i.id === keywordId);
    if (item) return item.label;
  }
  return keywordId;
}

const ENDINGS = [
  '내일도 간식 주면 좋겠다.',
  '집사야, 오늘도 수고했다.',
  '꼬리 흔들며 잠든다.',
  '집사가 나를 보고 웃었다. 나도 기분 좋다.',
  '내일은 더 많이 놀고 싶다.',
  '오늘도 집사 곁에서 잘 잔다. 굿나잇.',
  '배부르고 따뜻하다. 행복하다.',
  '내일도 산책 가자, 집사야!',
  '집사 발 위에 턱 올리고 잔다...',
];

export function generateDiary(
  keywords: string[],
  mood: string,
  weather: string,
): string {
  const template = pick(DIARY_TEMPLATES);

  const moodPhrase = MOOD_PHRASES[mood]
    ? pick(MOOD_PHRASES[mood]!)
    : '좋은';

  const weatherPhrase = WEATHER_PHRASES[weather]
    ? pick(WEATHER_PHRASES[weather]!)
    : '평범한';

  // Collect activity and food phrases
  const actPhrases: string[] = [];
  for (const kw of keywords) {
    if (ACTIVITY_PHRASES[kw]) {
      actPhrases.push(pick(ACTIVITY_PHRASES[kw]!));
    }
    if (FOOD_PHRASES[kw]) {
      actPhrases.push(pick(FOOD_PHRASES[kw]!));
    }
  }

  const activitiesText =
    actPhrases.length > 0
      ? actPhrases.join(' ')
      : '집에서 뒹굴거렸다.';

  const ending = pick(ENDINGS);

  const diary = template
    .replace('{weather}', weatherPhrase)
    .replace('{mood}', moodPhrase)
    .replace('{activities}', activitiesText)
    .replace('{ending}', ending);

  const allKeywords = [mood, weather, ...keywords];
  const tags = allKeywords.map((k) => `#${getKeywordLabel(k)}`).join(' ');

  return `${diary}\n\n${tags}`;
}
