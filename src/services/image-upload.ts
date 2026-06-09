import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

const BUCKET = 'diary-images';
const MAX_SIZE = 1024; // 최대 1024px
const QUALITY = 0.8;

/**
 * 웹에서 이미지 리사이징
 */
function resizeImageWeb(imageUri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let w = img.width;
      let h = img.height;

      if (w > MAX_SIZE || h > MAX_SIZE) {
        if (w > h) {
          h = Math.round((h * MAX_SIZE) / w);
          w = MAX_SIZE;
        } else {
          w = Math.round((w * MAX_SIZE) / h);
          h = MAX_SIZE;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('리사이징 실패'));
        },
        'image/jpeg',
        QUALITY,
      );
    };
    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = imageUri;
  });
}

/**
 * 네이티브에서 이미지 리사이징
 */
async function resizeImageNative(imageUri: string): Promise<string> {
  try {
    const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
    const result = await manipulateAsync(
      imageUri,
      [{ resize: { width: MAX_SIZE } }],
      { compress: QUALITY, format: SaveFormat.JPEG },
    );
    return result.uri;
  } catch {
    // manipulator 실패 시 원본 반환
    return imageUri;
  }
}

/**
 * 이미지를 리사이징 후 Supabase Storage에 업로드, public URL 반환
 */
export async function uploadDiaryImage(
  imageUri: string,
  userId: string,
  date: string,
  suffix: string = 'original',
): Promise<string> {
  const filename = `${userId}/${date}_${suffix}_${Date.now()}.jpg`;

  if (Platform.OS === 'web') {
    const blob = await resizeImageWeb(imageUri);

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  } else {
    const resizedUri = await resizeImageNative(imageUri);
    const base64 = await FileSystem.readAsStringAsync(resizedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, decode(base64), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  }
}
