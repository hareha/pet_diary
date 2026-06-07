import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DiaryPage from '@/components/diary/DiaryPage';
import { getDiaryEntry, deleteDiaryEntry } from '@/services/storage';
import type { DiaryEntry } from '@/types/diary';

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${parseInt(m!, 10)}월 ${parseInt(d!, 10)}일`;
}

export default function DiaryDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (date) {
      loadEntry(date);
    }
  }, [date]);

  async function loadEntry(d: string) {
    setLoading(true);
    const result = await getDiaryEntry(d);
    setEntry(result);
    setLoading(false);
  }

  function handleDelete() {
    if (!date) return;
    Alert.alert(
      '일기 삭제',
      '정말 이 일기를 삭제할까요? 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await deleteDiaryEntry(date);
            router.back();
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerWrap}>
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerWrap}>
          <Text style={styles.emptyText}>
            {date ? `${formatDate(date)}의 일기가 없어요` : '일기를 찾을 수 없어요'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
          <Text style={styles.navBackText}>돌아가기</Text>
        </TouchableOpacity>

        {/* Diary Page */}
        <DiaryPage
          date={entry.date}
          weather={entry.weather}
          mood={entry.mood}
          imageUri={entry.originalImageUri}
          diaryText={entry.diaryText}
          keywords={entry.keywords}
        />

        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>일기 삭제</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5EDE4',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#B0A090',
  },
  emptyText: {
    fontSize: 16,
    color: '#8C7B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E8DDD0',
  },
  backButtonText: {
    color: '#5D4E3C',
    fontWeight: '600',
  },
  navBack: {
    marginBottom: 12,
  },
  navBackText: {
    fontSize: 14,
    color: '#E88D67',
    fontWeight: '600',
  },
  deleteBtn: {
    alignSelf: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5EDE4',
    borderWidth: 1,
    borderColor: '#D8CCBB',
  },
  deleteBtnText: {
    fontSize: 13,
    color: '#CC6B5A',
    fontWeight: '500',
  },
});
