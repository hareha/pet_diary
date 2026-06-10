import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface ProfileAvatarProps {
  uri?: string | null;
  size?: number;
  editable?: boolean;
  onPress?: () => void;
  placeholder?: string;
}

export default function ProfileAvatar({
  uri,
  size = 100,
  editable = false,
  onPress,
  placeholder = '',
}: ProfileAvatarProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
      onPress={onPress}
      disabled={!editable && !onPress}
      activeOpacity={editable ? 0.7 : 1}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.placeholderText, { fontSize: size * 0.4 }]}>{placeholder}</Text>
        </View>
      )}
      {editable && (
        <View style={styles.editBadge}>
          <Text style={styles.editBadgeText}>📷</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position: 'relative',
  },
  placeholder: {
    backgroundColor: '#F5EDE4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E8DDD0',
  },
  placeholderText: {
    color: '#B0A090',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E88D67',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFDF9',
  },
  editBadgeText: {
    fontSize: 14,
  },
});
