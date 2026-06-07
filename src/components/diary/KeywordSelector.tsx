import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import KeywordChip from './KeywordChip';
import { KEYWORD_CATEGORIES } from '@/constants/keywords';

interface KeywordSelectorProps {
  selectedKeywords: string[];
  selectedMood: string;
  selectedWeather: string;
  onToggleKeyword: (categoryId: string, keywordId: string) => void;
}

export default function KeywordSelector({
  selectedKeywords,
  selectedMood,
  selectedWeather,
  onToggleKeyword,
}: KeywordSelectorProps) {
  function isSelected(categoryId: string, keywordId: string): boolean {
    if (categoryId === 'mood') return selectedMood === keywordId;
    if (categoryId === 'weather') return selectedWeather === keywordId;
    return selectedKeywords.includes(keywordId);
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {KEYWORD_CATEGORIES.map((category) => (
        <View key={category.id} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>
            {category.emoji} {category.label}
            {(category.id === 'mood' || category.id === 'weather') && (
              <Text style={styles.required}> (필수)</Text>
            )}
          </Text>
          <View style={styles.chipsContainer}>
            {category.items.map((item) => (
              <KeywordChip
                key={item.id}
                label={item.label}
                emoji={item.emoji}
                isSelected={isSelected(category.id, item.id)}
                onPress={() => onToggleKeyword(category.id, item.id)}
              />
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'Gaegu_700Bold',
    color: '#5D4E3C',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  required: {
    fontSize: 13,
    color: '#E88D67',
    fontFamily: 'Gaegu_400Regular',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
