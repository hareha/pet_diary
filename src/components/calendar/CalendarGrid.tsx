import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DayCell from './DayCell';
import type { DiaryEntry } from '@/types/diary';

interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: string;
  entries: Record<string, DiaryEntry>;
  onSelectDate: (date: string) => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function CalendarGrid({
  year,
  month,
  selectedDate,
  entries,
  onSelectDate,
}: CalendarGridProps) {
  const today = getTodayString();

  const weeks = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const result: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7));
    }
    return result;
  }, [year, month]);

  function makeDateString(day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {DAY_LABELS.map((label, i) => (
          <View key={label} style={styles.labelCell}>
            <Text
              style={[
                styles.labelText,
                i === 0 && styles.sundayLabel,
                i === 6 && styles.saturdayLabel,
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            const dateStr = day ? makeDateString(day) : '';
            const entry = day ? entries[dateStr] : undefined;
            return (
              <DayCell
                key={di}
                day={day}
                date={dateStr}
                isToday={dateStr === today}
                isSelected={dateStr === selectedDate}
                thumbnailUri={entry?.thumbnail_url || entry?.original_image_url}
                onPress={onSelectDate}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  labelCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    marginHorizontal: 1,
  },
  labelText: {
    fontSize: 11,
    color: '#B0A090',
    fontFamily: 'Gaegu_700Bold',
  },
  sundayLabel: {
    color: '#E88D67',
  },
  saturdayLabel: {
    color: '#7EAAC5',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
});
