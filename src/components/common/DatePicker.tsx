import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform,
} from 'react-native';

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const ITEM_HEIGHT = 44;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export default function DatePicker({
  label, value, onChange, placeholder = '날짜를 선택해주세요',
  minYear = 1990, maxYear,
}: DatePickerProps) {
  const currentYear = new Date().getFullYear();
  const max = maxYear ?? currentYear;
  const YEARS = Array.from({ length: max - minYear + 1 }, (_, i) => max - i);

  const [visible, setVisible] = useState(false);
  const [selYear, setSelYear] = useState(() => {
    if (value) return parseInt(value.split('-')[0]!);
    return currentYear;
  });
  const [selMonth, setSelMonth] = useState(() => {
    if (value) return parseInt(value.split('-')[1]!);
    return new Date().getMonth() + 1;
  });
  const [selDay, setSelDay] = useState(() => {
    if (value) return parseInt(value.split('-')[2]!);
    return new Date().getDate();
  });

  const days = Array.from(
    { length: getDaysInMonth(selYear, selMonth) },
    (_, i) => i + 1,
  );

  function handleConfirm() {
    const finalDay = Math.min(selDay, getDaysInMonth(selYear, selMonth));
    onChange(`${selYear}-${pad(selMonth)}-${pad(finalDay)}`);
    setVisible(false);
  }

  const displayValue = value
    ? `${value.split('-')[0]}년 ${parseInt(value.split('-')[1]!)}월 ${parseInt(value.split('-')[2]!)}일`
    : '';

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity style={styles.input} onPress={() => setVisible(true)}>
        <Text style={[styles.inputText, !displayValue && styles.placeholder]}>
          {displayValue || placeholder}
        </Text>
        <Text style={styles.icon}></Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>날짜 선택</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirmText}>확인</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerRow}>
              {/* 년 */}
              <View style={styles.pickerCol}>
                <Text style={styles.colLabel}>년</Text>
                <FlatList
                  data={YEARS}
                  keyExtractor={(item) => `y-${item}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.scrollList}
                  getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                  initialScrollIndex={Math.max(0, YEARS.indexOf(selYear))}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.pickerItem, item === selYear && styles.pickerItemSelected]}
                      onPress={() => setSelYear(item)}
                    >
                      <Text style={[styles.pickerText, item === selYear && styles.pickerTextSelected]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* 월 */}
              <View style={styles.pickerCol}>
                <Text style={styles.colLabel}>월</Text>
                <FlatList
                  data={MONTHS}
                  keyExtractor={(item) => `m-${item}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.scrollList}
                  getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                  initialScrollIndex={Math.max(0, selMonth - 1)}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.pickerItem, item === selMonth && styles.pickerItemSelected]}
                      onPress={() => setSelMonth(item)}
                    >
                      <Text style={[styles.pickerText, item === selMonth && styles.pickerTextSelected]}>
                        {item}월
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* 일 */}
              <View style={styles.pickerCol}>
                <Text style={styles.colLabel}>일</Text>
                <FlatList
                  data={days}
                  keyExtractor={(item) => `d-${item}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.scrollList}
                  getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                  initialScrollIndex={Math.max(0, Math.min(selDay, days.length) - 1)}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.pickerItem, item === selDay && styles.pickerItemSelected]}
                      onPress={() => setSelDay(item)}
                    >
                      <Text style={[styles.pickerText, item === selDay && styles.pickerTextSelected]}>
                        {item}일
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 15, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFF8', borderWidth: 1.5, borderColor: '#E8DDD0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inputText: { fontSize: 16, color: '#5D4E3C', fontFamily: 'Gaegu_400Regular' },
  placeholder: { color: '#C8BDB0' },
  icon: { fontSize: 18 },

  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAF6F0', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '60%',
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E8DDD0',
  },
  sheetTitle: { fontSize: 17, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C' },
  cancelText: { fontSize: 15, color: '#B0A090', fontFamily: 'Gaegu_700Bold' },
  confirmText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },

  pickerRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 8 },
  pickerCol: { flex: 1, alignItems: 'center' },
  colLabel: { fontSize: 13, color: '#B0A090', fontFamily: 'Gaegu_700Bold', marginBottom: 4 },
  scrollList: { height: 220 },

  pickerItem: {
    height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center',
    borderRadius: 10, marginHorizontal: 4, marginVertical: 2,
  },
  pickerItemSelected: { backgroundColor: '#FFF0E5' },
  pickerText: { fontSize: 16, color: '#8C7B6B', fontFamily: 'Gaegu_400Regular' },
  pickerTextSelected: { color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
});
