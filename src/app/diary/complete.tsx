import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/common/Button';

export default function DiaryCompleteScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.emoji}></Text>
        <Text style={styles.title}>일기가 완성되었어요!</Text>
        <Text style={styles.subtitle}>오늘도 멋진 추억을 남겼어요</Text>

        <View style={styles.actions}>
          <Button
            title="일기 보기"
            onPress={() => {
              if (date) {
                router.replace(`/diary/${date}`);
              } else {
                router.replace('/(tabs)');
              }
            }}
            fullWidth
          />
          <Button
            title="홈으로"
            onPress={() => router.replace('/(tabs)')}
            variant="secondary"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 28, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 8 },
  subtitle: { fontSize: 16, fontFamily: 'Gaegu_400Regular', color: '#B0A090', marginBottom: 40 },
  actions: { width: '100%', gap: 12 },
});
