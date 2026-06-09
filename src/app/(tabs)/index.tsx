import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import DiaryCard from '@/components/diary/DiaryCard';
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

function formatSelectedDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m!, 10)}월 ${parseInt(d!, 10)}일`;
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
  }

  function handleWriteDiary() {
    write.resetAll();
    write.setDate(selectedDate);
    router.push('/write/photo-select');
  }

  const selectedEntry = entries[selectedDate];
  const entryCount = Object.keys(entries).length;
  const TAB_BAR_HEIGHT = Platform.OS === 'web' ? 56 : 80;
  const isToday = selectedDate === today.dateString;

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
          <Text style={styles.appSubtitle}>반려동물이 쓰는 매일매일 일기</Text>
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

        {/* Selected date preview */}
        {selectedEntry ? (
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>{formatSelectedDate(selectedDate)}의 일기</Text>
            <DiaryCard
              entry={selectedEntry}
              onPress={() => router.push(`/diary/${selectedDate}`)}
            />
          </View>
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyTitle}>
              {isToday ? '오늘의 일기를 써보세요!' : `${formatSelectedDate(selectedDate)}에는 일기가 없어요`}
            </Text>
            <TouchableOpacity style={styles.writeBtn} onPress={handleWriteDiary} activeOpacity={0.7}>
              <Text style={styles.writeBtnText}>
                {isToday ? '오늘 일기 쓰기' : `${formatSelectedDate(selectedDate)} 일기 쓰기`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  previewSection: { marginTop: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 18, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginLeft: 16, marginBottom: 4 },
  emptySection: { alignItems: 'center', paddingVertical: 28, marginTop: 12 },
  emptyTitle: { fontSize: 17, color: '#B0A090', fontFamily: 'Gaegu_700Bold', marginBottom: 16 },
  writeBtn: {
    backgroundColor: '#E88D67', borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 14,
    shadowColor: '#E88D67', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  writeBtnText: { color: '#FFF', fontSize: 17, fontFamily: 'Gaegu_700Bold' },
});
