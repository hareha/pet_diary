import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWrite } from '@/contexts/write-context';
import DatePicker from '@/components/common/DatePicker';
import { CalendarIcon, WriteIcon } from '@/components/common/TabIcons';

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function WriteTab() {
  const { resetAll, setDate } = useWrite();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  function handleTodayWrite() {
    resetAll();
    setDate(getTodayString());
    router.push('/write/photo-select');
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
  }

  function handleDateConfirm() {
    resetAll();
    setDate(selectedDate);
    setShowDatePicker(false);
    router.push('/write/photo-select');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>일기 쓰기</Text>
        <Text style={styles.subtitle}>반려동물 일기를 작성해보세요</Text>

        {!showDatePicker ? (
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card} onPress={handleTodayWrite} activeOpacity={0.7}>
              <View style={styles.iconWrap}>
                <WriteIcon size={28} color="#E88D67" />
              </View>
              <Text style={styles.cardTitle}>오늘의 일기 작성</Text>
              <Text style={styles.cardDesc}>오늘 있었던 일을 기록해요</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
              <View style={styles.iconWrap}>
                <CalendarIcon size={28} color="#E88D67" />
              </View>
              <Text style={styles.cardTitle}>날짜 선택 후 작성</Text>
              <Text style={styles.cardDesc}>다른 날의 일기를 작성해요</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.datePickerSection}>
            <Text style={styles.datePickerTitle}>날짜를 선택하세요</Text>
            <DatePicker value={selectedDate} onChange={handleDateSelect} />
            <View style={styles.dateActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleDateConfirm}>
                <Text style={styles.confirmBtnText}>이 날짜로 쓰기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>작성 팁</Text>
          <Text style={styles.tipText}>
            사진을 올리면 AI가 반려동물을 분석하고,{'\n'}
            기분과 상황을 선택하면 1인칭 일기가 완성돼요!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  container: { flex: 1, padding: 24, paddingTop: 16 },
  title: { fontSize: 28, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', textAlign: 'center' },
  subtitle: { fontSize: 15, fontFamily: 'Gaegu_400Regular', color: '#B0A090', textAlign: 'center', marginTop: 4, marginBottom: 32 },
  cardContainer: { gap: 16 },
  card: {
    backgroundColor: '#FFFFF8', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E8DDD0',
    padding: 24, alignItems: 'center',
  },
  iconWrap: { marginBottom: 12 },
  cardTitle: { fontSize: 20, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 4 },
  cardDesc: { fontSize: 14, fontFamily: 'Gaegu_400Regular', color: '#B0A090' },

  datePickerSection: {
    backgroundColor: '#FFFFF8', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E8DDD0',
    padding: 20, alignItems: 'center',
  },
  datePickerTitle: { fontSize: 18, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 16 },
  dateActions: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#F5EDE4', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 16, fontFamily: 'Gaegu_700Bold', color: '#B0A090' },
  confirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#E88D67', alignItems: 'center',
  },
  confirmBtnText: { fontSize: 16, fontFamily: 'Gaegu_700Bold', color: '#FFF' },

  tipCard: {
    marginTop: 24, backgroundColor: '#FFF0E5', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  tipTitle: { fontSize: 16, fontFamily: 'Gaegu_700Bold', color: '#E88D67', marginBottom: 8 },
  tipText: { fontSize: 14, fontFamily: 'Gaegu_400Regular', color: '#8C7B6B', textAlign: 'center', lineHeight: 22 },
});
