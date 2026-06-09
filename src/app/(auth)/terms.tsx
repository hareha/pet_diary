import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>

        <Text style={styles.title}>이용약관</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제1조 (목적)</Text>
          <Text style={styles.body}>
            이 약관은 "우리 아이 일기" 서비스(이하 "서비스")의 이용에 관한 기본적인 사항을 규정함을 목적으로 합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제2조 (서비스의 내용)</Text>
          <Text style={styles.body}>
            서비스는 반려동물의 일상을 기록하고 공유할 수 있는 일기 작성 플랫폼을 제공합니다.{'\n'}
            - 반려동물 사진 기반 AI 일기 생성{'\n'}
            - 캘린더 형태의 일기 관리{'\n'}
            - 일기 공유 기능
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제3조 (개인정보 처리)</Text>
          <Text style={styles.body}>
            서비스는 이용자의 개인정보를 소중히 다루며, 관련 법령에 따라 처리합니다.{'\n'}
            수집하는 정보: 이메일, 닉네임, 반려동물 정보, 사진{'\n'}
            이용 목적: 서비스 제공, 계정 관리{'\n'}
            보관 기간: 회원 탈퇴 시까지
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제4조 (이용자의 의무)</Text>
          <Text style={styles.body}>
            이용자는 서비스를 이용함에 있어 다음 행위를 하여서는 안 됩니다.{'\n'}
            - 타인의 정보 도용{'\n'}
            - 서비스에 위해를 가하는 행위{'\n'}
            - 기타 관련 법령에 위배되는 행위
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제5조 (서비스 변경 및 중단)</Text>
          <Text style={styles.body}>
            서비스는 운영상 또는 기술상의 필요에 의해 변경 또는 중단될 수 있으며, 이 경우 사전에 공지합니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { padding: 24, paddingBottom: 60 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 15, color: '#E88D67', fontFamily: 'Gaegu_700Bold' },
  title: { fontSize: 26, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontFamily: 'Gaegu_700Bold', color: '#5D4E3C', marginBottom: 6 },
  body: { fontSize: 14, color: '#8C7B6B', lineHeight: 22, fontFamily: 'Gaegu_400Regular' },
});
