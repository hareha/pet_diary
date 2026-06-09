import React from 'react';
import Svg, { Path, G, Rect, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
}

/** 카카오톡 - 공식 브랜드 심볼 (말풍선) */
export function KakaoIcon({ size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.74 4.93 4.36 6.24-.14.52-.9 3.34-.93 3.56 0 0-.02.16.08.22.1.06.22.02.22.02.29-.04 3.36-2.2 3.88-2.56.78.12 1.58.18 2.39.18 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"
        fill="#3C1E1E"
      />
    </Svg>
  );
}

/** Google - 공식 G 로고 */
export function GoogleIcon({ size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <Path d="M5.84 14.09A6.01 6.01 0 015.52 12c0-.72.12-1.42.32-2.09V7.07H2.18A10 10 0 002 12c0 1.61.39 3.14 1.07 4.49l3.77-2.4z" fill="#FBBC05"/>
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </Svg>
  );
}

/** Apple - 공식 로고 */
export function AppleIcon({ size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.02 8.84 8.76c1.28.07 2.17.72 2.92.76.96-.2 1.88-.87 2.92-.78 1.24.1 2.17.59 2.79 1.51-2.56 1.53-1.95 4.88.53 5.82-.45 1.17-.66 1.7-1.25 2.72-.68 1.14-1.64 2.56-2.82 2.59-.58.01-1.01-.28-1.62-.28-.62 0-1.08.29-1.69.29h-.13c-1.02-.04-1.88-1.25-2.56-2.39-1.9-3.18-2.1-6.92-.93-8.9.83-1.4 2.14-2.22 3.53-2.22.88 0 1.61.36 2.17.36.54 0 1.37-.45 2.46-.38.85.04 3.24.34 3.78 2.57-3.47 1.46-2.92 6.15.6 7.13z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

/** 다운로드/앨범 저장 아이콘 */
export function DownloadIcon({ size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 15V3M12 15l-4-4M12 15l4-4" stroke="#5D4E3C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M2 17l.62 2.48A2 2 0 004.56 21h14.88a2 2 0 001.94-1.52L22 17" stroke="#5D4E3C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

/** 인스타그램 아이콘 */
export function InstagramIcon({ size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={2} width={20} height={20} rx={5} stroke="#E1306C" strokeWidth={2}/>
      <Circle cx={12} cy={12} r={5} stroke="#E1306C" strokeWidth={2}/>
      <Circle cx={18} cy={6} r={1.5} fill="#E1306C"/>
    </Svg>
  );
}

/** 공유 아이콘 */
export function ShareIcon({ size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="#5D4E3C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M16 6l-4-4-4 4" stroke="#5D4E3C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 2v13" stroke="#5D4E3C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
