import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface StyledImageProps {
  uri: string;
  size?: number;
}

/**
 * Phase 1: CSS-like filters for illustration style
 * Phase 2: Display Imagen-transformed image
 */
export default function StyledImage({ uri, size = 280 }: StyledImageProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Paper background texture feel */}
      <View style={[styles.paperBg, { width: size, height: size }]} />
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: size - 16,
            height: size - 16,
          },
        ]}
        contentFit="cover"
      />
      {/* Illustration overlay effect */}
      <View style={[styles.overlay, { width: size - 16, height: size - 16 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  paperBg: {
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: '#FFF8F0',
    borderWidth: 2,
    borderColor: '#E8D8C8',
  },
  image: {
    borderRadius: 16,
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#D4C0A8',
    zIndex: 2,
    opacity: 0.5,
  },
});
