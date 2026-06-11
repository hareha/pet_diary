import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import { getDiaryEntriesForMonth } from '@/services/storage';
import { usePet } from '@/contexts/pet-context';
import { useWrite } from '@/contexts/write-context';
import type { DiaryEntry } from '@/types/diary';

function getTodayParts() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    dateString: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
  };
}

export default function CalendarScreen() {
  const today = getTodayParts();
  const { pet } = usePet();
  const write = useWrite();
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [selectedDate, setSelectedDate] = useState(today.dateString);
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [year, month]),
  );

  async function loadEntries() {
    const result = await getDiaryEntriesForMonth(year, month);
    setEntries(result as any);
  }

  function handlePrevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    const entry = entries[date];
    if (entry) {
      // 일기가 있으면 상세 보기로 이동
      router.push(`/diary/${date}`);
    } else {
      // 일기가 없으면 작성 화면으로 바로 이동
      write.resetAll();
      write.setDate(date);
      router.push('/write/photo-select');
    }
  }

  const entryCount = Object.keys(entries).length;
  const TAB_BAR_HEIGHT = Platform.OS === 'web' ? 56 : 80;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Title */}
        <View style={styles.titleWrap}>
          <Text style={styles.appTitle}>
            {pet?.name ? `${pet.name}의 일기` : '우리 아이 일기'}
          </Text>
          <Text style={styles.appSubtitle}>날짜를 눌러 일기를 쓰거나 확인하세요</Text>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <CalendarHeader
            year={year}
            month={month}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          <CalendarGrid
            year={year}
            month={month}
            selectedDate={selectedDate}
            entries={entries}
            onSelectDate={handleSelectDate}
          />
          {entryCount > 0 && (
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                이번 달 {entryCount}개의 일기
              </Text>
            </View>
          )}
        </View>

        {/* 안내 */}
        <View style={styles.tipSection}>
          <Text style={styles.tipEmoji}>📝</Text>
          <Text style={styles.tipText}>날짜를 탭하면 일기를 쓰거나 볼 수 있어요</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  container: { flex: 1 },
  titleWrap: { alignItems: 'center', paddingTop: 16, paddingBottom: 12 },
  appTitle: { fontSize: 30, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C' },
  appSubtitle: { fontSize: 15, color: '#B0A090', marginTop: 2, fontFamily: 'Gaegu_400Regular' },
  calendarCard: {
    marginHorizontal: 10, backgroundColor: '#FFFFF8', borderRadius: 16,
    paddingBottom: 12, borderWidth: 1.5, borderColor: '#E8DDD0',
  },
  statsRow: {
    alignItems: 'center', paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#F0E8DD',
    marginHorizontal: 16, marginTop: 6,
  },
  statsText: { fontSize: 14, color: '#B0A090', fontFamily: 'Gaegu_400Regular' },
  tipSection: {
    alignItems: 'center', paddingVertical: 24, marginTop: 12,
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  tipEmoji: { fontSize: 18 },
  tipText: { fontSize: 15, color: '#B0A090', fontFamily: 'Gaegu_400Regular' },
});

