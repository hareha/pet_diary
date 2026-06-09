import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuList from '@/components/common/MenuList';
import Button from '@/components/common/Button';
import { getUserSettings, saveUserSettings } from '@/services/user-storage';

export default function NotificationsScreen() {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const settings = await getUserSettings();
    if (settings) {
      setNotificationEnabled(settings.notification_enabled);
    }
    setLoading(false);
  }

  async function handleToggle(value: boolean) {
    setNotificationEnabled(value);
    try {
      await saveUserSettings({ notification_enabled: value });
    } catch {
      // ignore
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>알림 설정</Text>

        <MenuList
          items={[
            {
              id: 'daily-reminder',
              label: '일기 작성 알림',
              icon: '',
              subtitle: '매일 저녁 8시에 알려드려요',
              type: 'toggle',
              value: notificationEnabled,
              onToggle: handleToggle,
            },
          ]}
        />

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            알림을 허용하면 매일 일기 작성을 잊지 않도록 도와드려요.{'\n'}
            기기의 알림 설정도 확인해주세요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 24 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  title: { fontSize: 24, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 20 },
  notice: { marginTop: 16, backgroundColor: '#F5EDE4', borderRadius: 12, padding: 14 },
  noticeText: { fontSize: 13, color: '#8C7B6B', fontFamily: 'Gaegu_400Regular', lineHeight: 20 },
});
