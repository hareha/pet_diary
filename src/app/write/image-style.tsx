import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Dimensions, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useWrite } from '@/contexts/write-context';
import { transformToCrayon } from '@/services/image-transform';
import Svg, { Path } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

function CloseIcon({ size = 24, color = '#FFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ImageStyleScreen() {
  const { imageUri, styledImageUri, setStyledImageUri, imageStyle, setImageStyle, imageStyleTarget, setImageStyleTarget } = useWrite();
  const [transforming, setTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 탭 상태: 'diary' | 'thumbnail'
  const [activeTab, setActiveTab] = useState<'diary' | 'thumbnail'>(
    imageStyleTarget === 'thumbnail' ? 'thumbnail' : 'diary'
  );

  async function handleStyleChange(styleId: string) {
    setImageStyle(styleId as any);
    setError(null);

    if (styleId === 'crayon' && !styledImageUri && imageUri) {
      setTransforming(true);
      try {
        const result = await transformToCrayon(imageUri);
        setStyledImageUri(result);
      } catch (err: any) {
        console.error('변환 실패:', err);
        setError(err.message || '이미지 변환에 실패했습니다.');
        setImageStyle('original');
      } finally {
        setTransforming(false);
      }
    }
  }

  async function handleRetry() {
    if (!imageUri) return;
    setError(null);
    setTransforming(true);
    try {
      const result = await transformToCrayon(imageUri);
      setStyledImageUri(result);
      setImageStyle('crayon');
    } catch (err: any) {
      setError(err.message || '이미지 변환에 실패했습니다.');
    } finally {
      setTransforming(false);
    }
  }

  function handleTabChange(tab: 'diary' | 'thumbnail') {
    setActiveTab(tab);
    if (tab === 'diary') {
      setImageStyleTarget('diary');
    } else {
      setImageStyleTarget('thumbnail');
    }
  }

  function handleNext() {
    router.push('/write/thumbnail');
  }

  const displayUri = imageStyle === 'crayon' && styledImageUri ? styledImageUri : imageUri;
  const isOriginal = imageStyle === 'original';
  const isCrayon = imageStyle === 'crayon';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <CloseIcon />
        </TouchableOpacity>

        {/* Tab: 일기 이미지 / 캘린더 썸네일 */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'diary' && styles.tabActive]}
            onPress={() => handleTabChange('diary')}
          >
            <Text style={[styles.tabText, activeTab === 'diary' && styles.tabTextActive]}>
              일기 이미지
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'thumbnail' && styles.tabActive]}
            onPress={() => handleTabChange('thumbnail')}
          >
            <Text style={[styles.tabText, activeTab === 'thumbnail' && styles.tabTextActive]}>
              캘린더 썸네일
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerBtn} />
      </View>

      {/* 이미지 프리뷰 (화면 대부분) */}
      <View style={styles.previewArea}>
        {transforming ? (
          <View style={styles.transformingOverlay}>
            <ActivityIndicator size="large" color="#E88D67" />
            <Text style={styles.transformingText}>크레파스 드로잉으로 변환 중...</Text>
            <Text style={styles.transformingSub}>30초 정도 걸릴 수 있어요</Text>
          </View>
        ) : displayUri ? (
          <Image
            source={{ uri: displayUri }}
            style={styles.previewImage}
            contentFit="contain"
          />
        ) : null}

        {/* 스타일 라벨 */}
        {!transforming && (
          <View style={styles.styleLabelWrap}>
            <Text style={styles.styleLabel}>
              {isOriginal ? '📷 원본 사진' : '🖍️ 크레파스 드로잉'}
            </Text>
          </View>
        )}

        {/* 에러 */}
        {error && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 하단 도구 바 */}
      <View style={styles.bottomToolbar}>
        {/* 스타일 선택 버튼들 */}
        <View style={styles.toolRow}>
          <TouchableOpacity
            style={[styles.toolItem, isOriginal && styles.toolItemActive]}
            onPress={() => handleStyleChange('original')}
          >
            <View style={[styles.toolIcon, isOriginal && styles.toolIconActive]}>
              <Text style={styles.toolEmoji}>📷</Text>
            </View>
            <Text style={[styles.toolLabel, isOriginal && styles.toolLabelActive]}>원본</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolItem, isCrayon && styles.toolItemActive]}
            onPress={() => handleStyleChange('crayon')}
          >
            <View style={[styles.toolIcon, isCrayon && styles.toolIconActive]}>
              <Text style={styles.toolEmoji}>🖍️</Text>
            </View>
            <Text style={[styles.toolLabel, isCrayon && styles.toolLabelActive]}>크레파스</Text>
          </TouchableOpacity>

          {styledImageUri && (
            <TouchableOpacity
              style={styles.toolItem}
              onPress={handleRetry}
            >
              <View style={styles.toolIcon}>
                <Text style={styles.toolEmoji}>🔄</Text>
              </View>
              <Text style={styles.toolLabel}>재생성</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 다음 버튼 */}
        <TouchableOpacity
          style={[styles.nextBtn, transforming && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={transforming}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>다음</Text>
          <Text style={styles.nextBtnArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 SafeArea 패딩 */}
      <View style={styles.bottomSafe} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A1A1A' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 50,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 3,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 17,
  },
  tabActive: {
    backgroundColor: '#E88D67',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Gaegu_700Bold',
    color: '#999',
  },
  tabTextActive: {
    color: '#FFF',
  },

  // Preview
  previewArea: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  styleLabelWrap: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  styleLabel: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Gaegu_700Bold',
  },

  // Transform overlay
  transformingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  transformingText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Gaegu_700Bold',
    marginTop: 16,
  },
  transformingSub: {
    color: '#AAA',
    fontSize: 13,
    fontFamily: 'Gaegu_400Regular',
    marginTop: 4,
  },

  // Error overlay
  errorOverlay: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(200, 60, 30, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH - 48,
  },
  errorText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Gaegu_400Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryBtn: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  retryText: {
    color: '#D04020',
    fontFamily: 'Gaegu_700Bold',
    fontSize: 13,
  },

  // Bottom toolbar
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#333',
  },
  toolRow: {
    flexDirection: 'row',
    gap: 20,
  },
  toolItem: {
    alignItems: 'center',
    opacity: 0.7,
  },
  toolItemActive: {
    opacity: 1,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIconActive: {
    backgroundColor: '#3A3A3A',
    borderWidth: 2,
    borderColor: '#E88D67',
  },
  toolEmoji: {
    fontSize: 20,
  },
  toolLabel: {
    fontSize: 11,
    fontFamily: 'Gaegu_700Bold',
    color: '#888',
    marginTop: 4,
  },
  toolLabelActive: {
    color: '#E88D67',
  },

  // Next button
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5B6BF5',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Gaegu_700Bold',
  },
  nextBtnArrow: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Gaegu_700Bold',
  },

  bottomSafe: {
    height: Platform.OS === 'web' ? 8 : 24,
    backgroundColor: '#1A1A1A',
  },
});
