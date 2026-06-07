import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { KEYWORD_CATEGORIES } from '@/constants/keywords';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PAGE_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);

interface DiaryPageProps {
  date: string; // YYYY-MM-DD
  weather: string;
  mood: string;
  imageUri: string;
  diaryText: string;
  keywords: string[];
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const WEATHER_LABELS: Record<string, string> = {
  sunny: '맑음',
  cloudy: '흐림',
  rainy: '비',
  snowy: '눈',
  hot: '더움',
  cold: '추움',
};

function getKeywordLabel(id: string): string {
  for (const cat of KEYWORD_CATEGORIES) {
    const item = cat.items.find((i) => i.id === id);
    if (item) return item.label;
  }
  return id;
}

function formatDateParts(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y!, m! - 1, d);
  const weekday = WEEKDAYS[dateObj.getDay()]!;
  return {
    year: y!,
    month: m!,
    day: d!,
    weekday,
  };
}

export default function DiaryPage({
  date,
  weather,
  mood,
  imageUri,
  diaryText,
  keywords,
}: DiaryPageProps) {
  const { year, month, day, weekday } = formatDateParts(date);
  const weatherLabel = WEATHER_LABELS[weather] || weather;

  // Split diary text into lines (remove hashtag line)
  const lines = diaryText.split('\n').filter((l) => !l.startsWith('#'));
  const mainText = lines.join(' ').trim();

  // Break text into chunks for grid cells
  const chars = mainText.split('');

  return (
    <View style={styles.paper}>
      {/* Header: 그림일기 */}
      <View style={styles.headerRow}>
        <Text style={styles.headerSub}>우리 아이의</Text>
        <Text style={styles.headerTitle}>그림일기</Text>
      </View>

      {/* Date & Weather Row */}
      <View style={styles.dateRow}>
        <View style={styles.dateLabel}>
          <Text style={styles.dateLabelText}>날짜</Text>
        </View>
        <View style={styles.dateValue}>
          <Text style={styles.dateValueText}>
            {year}년 {month}월 {day}일 {weekday}요일
          </Text>
        </View>
        <View style={styles.dateLabel}>
          <Text style={styles.dateLabelText}>날씨</Text>
        </View>
        <View style={styles.weatherValue}>
          <Text style={styles.weatherValueText}>{weatherLabel}</Text>
        </View>
      </View>

      {/* Drawing Area */}
      <View style={styles.drawingArea}>
        <Image
          source={{ uri: imageUri }}
          style={styles.drawingImage}
          contentFit="cover"
        />
      </View>

      {/* Title Row */}
      <View style={styles.titleRow}>
        <View style={styles.titleLabel}>
          <Text style={styles.titleLabelText}>제목 :</Text>
        </View>
        <View style={styles.titleValue}>
          <Text style={styles.titleValueText}>
            {getKeywordLabel(mood)} 하루
          </Text>
        </View>
      </View>

      {/* Grid Text Area (원고지 style) */}
      <View style={styles.gridArea}>
        <View style={styles.gridContent}>
          {/* Render text in grid rows */}
          {Array.from({ length: Math.ceil(chars.length / 14) + 1 }, (_, rowIdx) => {
            const rowChars = chars.slice(rowIdx * 14, (rowIdx + 1) * 14);
            if (rowChars.length === 0 && rowIdx > 0) return null;
            return (
              <View key={rowIdx} style={styles.gridRow}>
                {Array.from({ length: 14 }, (_, colIdx) => (
                  <View key={colIdx} style={styles.gridCell}>
                    <Text style={styles.gridChar}>
                      {rowChars[colIdx] || ''}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
          {/* Fill remaining rows to look like proper paper */}
          {Array.from({ length: Math.max(0, 5 - Math.ceil(chars.length / 14)) }, (_, i) => (
            <View key={`empty-${i}`} style={styles.gridRow}>
              {Array.from({ length: 14 }, (_, colIdx) => (
                <View key={colIdx} style={styles.gridCell} />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Keywords */}
      <View style={styles.tagsRow}>
        {[mood, weather, ...keywords].map((kw, i) => (
          <Text key={`${kw}-${i}`} style={styles.tagText}>
            #{getKeywordLabel(kw)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    width: PAGE_WIDTH,
    backgroundColor: '#FFFFF8',
    borderWidth: 2,
    borderColor: '#C8B8A0',
    borderRadius: 4,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  headerRow: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D8CCBB',
  },
  headerSub: {
    fontSize: 11,
    color: '#A09080',
    marginBottom: 2,
    fontFamily: 'Gaegu_400Regular',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Gaegu_700Bold',
    color: '#3D3028',
    letterSpacing: 6,
  },
  dateRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D8CCBB',
    height: 32,
  },
  dateLabel: {
    backgroundColor: '#F5EDE0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#D8CCBB',
  },
  dateLabelText: {
    fontSize: 12,
    fontFamily: 'Gaegu_700Bold',
    color: '#5D4E3C',
  },
  dateValue: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#D8CCBB',
  },
  dateValueText: {
    fontSize: 15,
    color: '#3D3028',
    fontFamily: 'Gaegu_400Regular',
  },
  weatherValue: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    minWidth: 50,
  },
  weatherValueText: {
    fontSize: 15,
    color: '#3D3028',
    fontFamily: 'Gaegu_400Regular',
    textAlign: 'center',
  },
  drawingArea: {
    aspectRatio: 4 / 3,
    borderBottomWidth: 1,
    borderBottomColor: '#D8CCBB',
    backgroundColor: '#FFFFF8',
  },
  drawingImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D8CCBB',
    height: 32,
  },
  titleLabel: {
    backgroundColor: '#F5EDE0',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#D8CCBB',
  },
  titleLabelText: {
    fontSize: 14,
    fontFamily: 'Gaegu_700Bold',
    color: '#5D4E3C',
  },
  titleValue: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  titleValueText: {
    fontSize: 16,
    color: '#3D3028',
    fontFamily: 'Gaegu_700Bold',
  },
  gridArea: {
    padding: 4,
    minHeight: 100,
  },
  gridContent: {},
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  gridCell: {
    width: (PAGE_WIDTH - 12) / 14,
    height: (PAGE_WIDTH - 12) / 14,
    borderWidth: 0.5,
    borderColor: '#E0D8CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridChar: {
    fontSize: 13,
    color: '#3D3028',
    fontFamily: 'Gaegu_400Regular',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#D8CCBB',
  },
  tagText: {
    fontSize: 11,
    color: '#A09080',
    fontFamily: 'Gaegu_400Regular',
  },
});
