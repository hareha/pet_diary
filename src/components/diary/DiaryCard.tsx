import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import type { DiaryEntry } from '@/types/diary';

interface DiaryCardProps {
  entry: DiaryEntry;
  onPress: () => void;
}

export default function DiaryCard({ entry, onPress }: DiaryCardProps) {
  const text = entry.diary_text || '';
  const previewText = text.length > 80 ? text.slice(0, 80) + '...' : text;

  const imageUrl = entry.original_image_url;
  const tags = entry.keywords || entry.situation || [];

  // Format date nicely
  const [, m, d] = entry.date.split('-');
  const dateLabel = `${parseInt(m!, 10)}월 ${parseInt(d!, 10)}일`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.thumbnail}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.thumbnail, { backgroundColor: '#F5EDE4' }]} />
      )}
      <View style={styles.content}>
        <Text style={styles.dateText}>{dateLabel}</Text>
        <Text style={styles.diaryPreview} numberOfLines={3}>
          {previewText}
        </Text>
        <View style={styles.tagsRow}>
          {tags.slice(0, 3).map((kw) => (
            <View key={kw} style={styles.tag}>
              <Text style={styles.tagText}>#{kw}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFBF7',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#D4C4B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F5EDE4',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 14,
    marginRight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#B0A090',
    fontFamily: 'Gaegu_700Bold',
    marginBottom: 4,
  },
  diaryPreview: {
    fontSize: 14,
    color: '#5D4E3C',
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'Gaegu_400Regular',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#E88D67',
    fontFamily: 'Gaegu_400Regular',
  },
});
