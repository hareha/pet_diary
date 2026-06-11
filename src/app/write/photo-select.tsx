import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions,
  Platform, FlatList, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  requestPermissionsAsync,
  Query,
  AssetField,
  MediaType,
} from 'expo-media-library';
import type { Asset as MLAsset } from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useWrite } from '@/contexts/write-context';
import Svg, { Path, Circle } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 4;
const CELL_SIZE = (SCREEN_WIDTH - 3) / NUM_COLUMNS;
const PREVIEW_HEIGHT = SCREEN_WIDTH * 0.75;
const PAGE_SIZE = 48;

interface GalleryAsset {
  id: string;
  uri: string; // asset.id serves as the URI in SDK 56
}

function CameraIcon({ size = 28, color = '#FFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.5 4h-5L7.5 6H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-3.5L14.5 4z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="3.5" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function CloseIcon({ size = 24, color = '#5D4E3C' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function PhotoSelectScreen() {
  const { imageUri, setImageUri } = useWrite();
  const [mlAssets, setMlAssets] = useState<MLAsset[]>([]);
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(imageUri);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const isLoadingMore = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setLoading(false);
      pickFromAlbumWeb();
    } else {
      requestPermissionAndLoad();
    }
  }, []);

  async function requestPermissionAndLoad() {
    const { status } = await requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      setLoading(false);
      return;
    }
    setPermissionGranted(true);
    await loadAssets(0);
  }

  async function loadAssets(offset: number) {
    if (isLoadingMore.current) return;
    isLoadingMore.current = true;

    try {
      const query = new Query()
        .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
        .orderBy(AssetField.CREATION_TIME)
        .limit(PAGE_SIZE)
        .offset(offset);

      const result: MLAsset[] = await query.exe();

      const newAssets: GalleryAsset[] = result.map((a) => ({
        id: a.id,
        uri: a.id,
      }));

      if (offset === 0) {
        setMlAssets(result);
        setAssets(newAssets);
        // 첫 로드 시 첫 번째 사진 자동 선택
        if (result.length > 0 && !imageUri) {
          selectAsset(result[0]!);
        }
      } else {
        setMlAssets((prev) => [...prev, ...result]);
        setAssets((prev) => [...prev, ...newAssets]);
      }

      setCurrentOffset(offset + result.length);
      setHasMore(result.length >= PAGE_SIZE);
    } catch (e) {
      console.error('사진 불러오기 실패:', e);
    } finally {
      setLoading(false);
      isLoadingMore.current = false;
    }
  }

  function loadMore() {
    if (hasMore && !isLoadingMore.current) {
      loadAssets(currentOffset);
    }
  }

  async function selectAsset(asset: MLAsset) {
    setSelectedAssetId(asset.id);
    setPreviewUri(asset.id); // 프리뷰 즉시 표시
    try {
      const fileUri = await asset.getUri();
      setImageUri(fileUri); // write context에는 실제 file:// URI 저장
    } catch (e) {
      console.error('URI 가져오기 실패:', e);
      setImageUri(asset.id); // fallback
    }
  }

  function handleSelectFromGrid(assetId: string) {
    const asset = mlAssets.find((a) => a.id === assetId);
    if (asset) {
      selectAsset(asset);
    }
  }

  async function pickFromAlbumWeb() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      if (Platform.OS === 'web') {
        window.alert('카메라 권한이 필요합니다.');
      } else {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
      }
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  function handleNext() {
    if (!imageUri) {
      if (Platform.OS === 'web') {
        window.alert('사진을 선택해주세요.');
      } else {
        Alert.alert('사진 필요', '사진을 선택해주세요.');
      }
      return;
    }
    router.push('/write/ai-analysis');
  }

  function handleClose() {
    setImageUri(null);
    router.back();
  }

  const renderGridItem = useCallback(({ item }: { item: GalleryAsset | 'camera' }) => {
    if (item === 'camera') {
      return (
        <TouchableOpacity
          style={styles.cameraCell}
          onPress={takePhoto}
          activeOpacity={0.7}
        >
          <CameraIcon size={28} color="#FFF" />
        </TouchableOpacity>
      );
    }

    const isSelected = selectedAssetId === item.id;
    return (
      <TouchableOpacity
        style={styles.gridCell}
        onPress={() => handleSelectFromGrid(item.id)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.id }}
          style={styles.gridImage}
          contentFit="cover"
        />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedCheck}>✓</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [imageUri]);

  const gridData: (GalleryAsset | 'camera')[] = ['camera', ...assets];

  // 웹 폴백
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
            <CloseIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>새 일기</Text>
          <TouchableOpacity onPress={handleNext} style={styles.headerBtn}>
            <Text style={[styles.headerAction, imageUri && styles.headerActionActive]}>다음</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.webFallback}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.webPreview} contentFit="cover" />
              <TouchableOpacity style={styles.webChangeBtn} onPress={pickFromAlbumWeb}>
                <Text style={styles.webChangeBtnText}>다른 사진 선택</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.webPickBtn} onPress={pickFromAlbumWeb}>
              <Text style={styles.webPickBtnText}>사진 선택하기</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
          <CloseIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>새 일기</Text>
        <TouchableOpacity onPress={handleNext} style={styles.headerBtn}>
          <Text style={[styles.headerAction, imageUri && styles.headerActionActive]}>다음</Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
      <View style={styles.previewArea}>
        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={styles.previewImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderText}>사진을 선택해주세요</Text>
          </View>
        )}
      </View>

      {/* Album Label */}
      <View style={styles.albumLabelRow}>
        <Text style={styles.albumLabel}>최근 항목</Text>
      </View>

      {/* Gallery Grid */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#E88D67" />
        </View>
      ) : !permissionGranted ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.permissionText}>사진 접근 권한을 허용해주세요</Text>
        </View>
      ) : (
        <FlatList
          data={gridData}
          renderItem={renderGridItem}
          keyExtractor={(item) => (item === 'camera' ? 'camera' : item.id)}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.gridRow}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.loadMoreWrap}>
                <ActivityIndicator size="small" color="#E88D67" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#FFFDF9',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8DDD0',
  },
  headerBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Gaegu_700Bold',
    color: '#5D4E3C',
  },
  headerAction: {
    fontSize: 16,
    fontFamily: 'Gaegu_700Bold',
    color: '#C8BDB0',
  },
  headerActionActive: {
    color: '#E88D67',
  },

  // Preview
  previewArea: {
    width: SCREEN_WIDTH,
    height: PREVIEW_HEIGHT,
    backgroundColor: '#1A1A1A',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlaceholderText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Gaegu_400Regular',
  },

  // Album label
  albumLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFDF9',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8DDD0',
  },
  albumLabel: {
    fontSize: 15,
    fontFamily: 'Gaegu_700Bold',
    color: '#5D4E3C',
  },

  // Grid
  gridRow: {
    gap: 1,
    marginBottom: 1,
  },
  gridCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(232, 141, 103, 0.3)',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: 6,
  },
  selectedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E88D67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheck: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Camera cell
  cameraCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Loading
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF9',
  },
  loadMoreWrap: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: '#B0A090',
    fontFamily: 'Gaegu_400Regular',
  },

  // Web fallback
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF6F0',
    padding: 24,
  },
  webPreview: {
    width: SCREEN_WIDTH - 48,
    height: SCREEN_WIDTH - 48,
    maxWidth: 400,
    maxHeight: 400,
    borderRadius: 16,
    backgroundColor: '#F5EDE4',
  },
  webChangeBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF0E5',
  },
  webChangeBtnText: {
    color: '#E88D67',
    fontFamily: 'Gaegu_700Bold',
    fontSize: 14,
  },
  webPickBtn: {
    backgroundColor: '#E88D67',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  webPickBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontFamily: 'Gaegu_700Bold',
  },
});
