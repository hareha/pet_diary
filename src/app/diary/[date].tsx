import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DiaryPage from '@/components/diary/DiaryPage';
import { getDiaryEntry, deleteDiaryEntry } from '@/services/storage';
import { shareContent, saveToAlbum, shareToKakao, shareToInstagram } from '@/services/share';
import type { DiaryEntry } from '@/types/diary';
import { KakaoIcon, InstagramIcon, DownloadIcon, ShareIcon } from '@/components/common/BrandIcons';

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${parseInt(m!, 10)}월 ${parseInt(d!, 10)}일`;
}

export default function DiaryDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (date) loadEntry(date);
  }, [date]);

  async function loadEntry(d: string) {
    setLoading(true);
    const result = await getDiaryEntry(d);
    setEntry(result);
    setLoading(false);
  }

  async function handleDelete() {
    if (!date) return;
    if (Platform.OS === 'web') {
      const ok = window.confirm('정말 이 일기를 삭제할까요?');
      if (!ok) return;
      try {
        await deleteDiaryEntry(date);
        router.back();
      } catch (e: any) {
        window.alert(e.message || '삭제 실패');
      }
    } else {
      Alert.alert('일기 삭제', '정말 이 일기를 삭제할까요?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDiaryEntry(date);
              router.back();
            } catch (e: any) {
              Alert.alert('삭제 실패', e.message);
            }
          },
        },
      ]);
    }
  }

  function handleAddComment() {
    if (comment.trim()) {
      setComments([...comments, comment.trim()]);
      setComment('');
    }
  }

  function handleShare() {
    if (!entry) return;
    setShowShare(true);
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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
          <Text style={styles.navBackText}>← 돌아가기</Text>
        </TouchableOpacity>

        {/* Diary Page */}
        <DiaryPage
          date={entry.date}
          weather={entry.weather}
          mood={entry.mood}
          imageUri={entry.original_image_url}
          diaryText={entry.diary_text || ''}
          keywords={entry.keywords || entry.situation || []}
        />

        {/* 공유 버튼 */}
        <View style={styles.shareSection}>
          <Text style={styles.shareSectionTitle}>저장 / 공유</Text>
          <View style={styles.shareButtons}>
            <TouchableOpacity style={styles.shareBtn} onPress={() => saveToAlbum(entry.original_image_url)}>
              <DownloadIcon size={22} />
              <Text style={styles.shareBtnText}>앨범 저장</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: '#FEE500' }]} onPress={() => shareToKakao(entry.original_image_url, entry.diary_text || '')}>
              <KakaoIcon size={20} />
              <Text style={[styles.shareBtnText, { color: '#191919' }]}>카카오톡</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={() => shareToInstagram(entry.original_image_url, entry.diary_text || '')}>
              <InstagramIcon size={22} />
              <Text style={[styles.shareBtnText, { color: '#E1306C' }]}>인스타</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={() => shareContent({ message: entry.diary_text || '', url: entry.original_image_url })}>
              <ShareIcon size={22} />
              <Text style={styles.shareBtnText}>공유</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 댓글 */}
        <View style={styles.commentSection}>
          <Text style={styles.commentTitle}>댓글 ({comments.length})</Text>
          {comments.map((c, i) => (
            <View key={i} style={styles.commentItem}>
              <Text style={styles.commentText}>{c}</Text>
            </View>
          ))}
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 남겨보세요..."
              placeholderTextColor="#C8BDB0"
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity style={styles.commentSendBtn} onPress={handleAddComment}>
              <Text style={styles.commentSendText}>전송</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  safeArea: { flex: 1, backgroundColor: '#F5EDE4' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { fontSize: 16, color: '#B0A090' },
  emptyText: { fontSize: 16, color: '#8C7B6B', textAlign: 'center', marginBottom: 20 },
  backButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#E8DDD0' },
  backButtonText: { color: '#5D4E3C', fontWeight: '600' },
  navBack: { marginBottom: 12 },
  navBackText: { fontSize: 14, color: '#E88D67', fontWeight: '600' },

  // 공유
  shareSection: { marginTop: 20 },
  shareSectionTitle: { fontSize: 16, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 10 },
  shareButtons: { flexDirection: 'row', gap: 10 },
  shareBtn: {
    flex: 1, backgroundColor: '#FFFFF8', borderRadius: 12,
    borderWidth: 1, borderColor: '#E8DDD0',
    paddingVertical: 12, alignItems: 'center',
  },
  shareBtnText: { fontSize: 11, color: '#8C7B6B', fontFamily: 'Gaegu_700Bold', marginTop: 4 },

  // 댓글
  commentSection: {
    marginTop: 20, backgroundColor: '#FFFFF8', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8DDD0', padding: 16,
  },
  commentTitle: { fontSize: 16, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 10 },
  commentItem: {
    backgroundColor: '#F5EDE4', borderRadius: 8, padding: 10, marginBottom: 8,
  },
  commentText: { fontSize: 14, color: '#5D4E3C', fontFamily: 'Gaegu_400Regular' },
  commentInputRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  commentInput: {
    flex: 1, backgroundColor: '#FAF6F0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 14,
    color: '#5D4E3C', fontFamily: 'Gaegu_400Regular',
  },
  commentSendBtn: {
    backgroundColor: '#E88D67', borderRadius: 8,
    paddingHorizontal: 14, justifyContent: 'center',
  },
  commentSendText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  deleteBtn: {
    alignSelf: 'center', marginTop: 20,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#F5EDE4', borderWidth: 1, borderColor: '#D8CCBB',
  },
  deleteBtnText: { fontSize: 13, color: '#CC6B5A', fontWeight: '500' },
});
