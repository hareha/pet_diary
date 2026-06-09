import { Platform } from 'react-native';

/**
 * 캔버스 기반 크레파스/그림일기 필터
 * 웹: Canvas API로 즉시 처리
 * 네이티브: 추후 expo-gl 등으로 확장 가능
 */
export async function transformToCrayon(imageUri: string): Promise<string> {
  if (Platform.OS === 'web') {
    return applyWebCrayonFilter(imageUri);
  } else {
    // 네이티브에서는 현재 원본 반환 (추후 expo-gl로 구현)
    return imageUri;
  }
}

/**
 * 웹 Canvas 기반 크레파스 효과
 * 1. 색상 수 축소 (포스터화)
 * 2. 부드러운 블러 (크레파스 느낌)
 * 3. 노이즈 텍스처 (종이 질감)
 * 4. 따뜻한 색조 오버레이
 * 5. 엣지 강조 (크레파스 선 느낌)
 */
function applyWebCrayonFilter(imageUri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 512;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // 정사각형으로 크롭
        const srcSize = Math.min(img.width, img.height);
        const sx = (img.width - srcSize) / 2;
        const sy = (img.height - srcSize) / 2;
        
        canvas.width = size;
        canvas.height = size;

        // 1단계: 이미지 그리기 (약간 블러)
        ctx.filter = 'blur(1.2px) saturate(1.4) contrast(1.1)';
        ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, size, size);
        ctx.filter = 'none';

        // 2단계: 포스터화 (색상 수 축소)
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        const levels = 8; // 색상 단계
        const step = 255 / levels;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.round(data[i]! / step) * step;     // R
          data[i + 1] = Math.round(data[i + 1]! / step) * step; // G
          data[i + 2] = Math.round(data[i + 2]! / step) * step; // B
          
          // 따뜻한 톤 추가
          data[i] = Math.min(255, data[i]! + 12);     // R +
          data[i + 2] = Math.max(0, data[i + 2]! - 8); // B -
        }
        ctx.putImageData(imageData, 0, 0);

        // 3단계: 노이즈 텍스처 (종이 질감)
        const noiseData = ctx.getImageData(0, 0, size, size);
        const nd = noiseData.data;
        for (let i = 0; i < nd.length; i += 4) {
          const noise = (Math.random() - 0.5) * 25;
          nd[i] = Math.min(255, Math.max(0, nd[i]! + noise));
          nd[i + 1] = Math.min(255, Math.max(0, nd[i + 1]! + noise));
          nd[i + 2] = Math.min(255, Math.max(0, nd[i + 2]! + noise));
        }
        ctx.putImageData(noiseData, 0, 0);

        // 4단계: 엣지 오버레이 (크레파스 윤곽선 느낌)
        const edgeCanvas = document.createElement('canvas');
        edgeCanvas.width = size;
        edgeCanvas.height = size;
        const ectx = edgeCanvas.getContext('2d')!;
        ectx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, size, size);
        
        // 엣지를 위한 소벨 필터 간소화
        const edgeData = ectx.getImageData(0, 0, size, size);
        const ed = edgeData.data;
        const edgeResult = new Uint8ClampedArray(ed.length);
        
        for (let y = 1; y < size - 1; y++) {
          for (let x = 1; x < size - 1; x++) {
            const idx = (y * size + x) * 4;
            // 간소화된 엣지 감지
            const left = (ed[(y * size + x - 1) * 4]! + ed[(y * size + x - 1) * 4 + 1]! + ed[(y * size + x - 1) * 4 + 2]!) / 3;
            const right = (ed[(y * size + x + 1) * 4]! + ed[(y * size + x + 1) * 4 + 1]! + ed[(y * size + x + 1) * 4 + 2]!) / 3;
            const top = (ed[((y - 1) * size + x) * 4]! + ed[((y - 1) * size + x) * 4 + 1]! + ed[((y - 1) * size + x) * 4 + 2]!) / 3;
            const bottom = (ed[((y + 1) * size + x) * 4]! + ed[((y + 1) * size + x) * 4 + 1]! + ed[((y + 1) * size + x) * 4 + 2]!) / 3;
            
            const edge = Math.abs(left - right) + Math.abs(top - bottom);
            edgeResult[idx] = edgeResult[idx + 1] = edgeResult[idx + 2] = Math.min(255, edge * 2);
            edgeResult[idx + 3] = 255;
          }
        }

        // 엣지를 메인 캔버스에 반전 합성 (어두운 윤곽선)
        const finalData = ctx.getImageData(0, 0, size, size);
        const fd = finalData.data;
        for (let i = 0; i < fd.length; i += 4) {
          const edgeVal = edgeResult[i]! / 255;
          const darken = 1 - edgeVal * 0.35;
          fd[i] = Math.round(fd[i]! * darken);
          fd[i + 1] = Math.round(fd[i + 1]! * darken);
          fd[i + 2] = Math.round(fd[i + 2]! * darken);
        }
        ctx.putImageData(finalData, 0, 0);

        // 5단계: 최종 부드러운 블러
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = size;
        finalCanvas.height = size;
        const fctx = finalCanvas.getContext('2d')!;
        fctx.filter = 'blur(0.5px)';
        fctx.drawImage(canvas, 0, 0);

        resolve(finalCanvas.toDataURL('image/jpeg', 0.9));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = imageUri;
  });
}
