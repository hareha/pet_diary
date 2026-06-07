import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface KeywordChipProps {
  label: string;
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function KeywordChip({
  label,
  emoji,
  isSelected,
  onPress,
}: KeywordChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSpring(0.85, { damping: 10, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 8, stiffness: 300 });
    });
    onPress();
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.chip, isSelected && styles.chipSelected]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, isSelected && styles.labelSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF8F2',
    borderWidth: 1.5,
    borderColor: '#F0E4D8',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#FFF0E5',
    borderColor: '#E88D67',
    shadowColor: '#E88D67',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 16,
    marginRight: 5,
  },
  label: {
    fontSize: 15,
    color: '#8C7B6B',
    fontFamily: 'Gaegu_400Regular',
  },
  labelSelected: {
    color: '#E88D67',
    fontFamily: 'Gaegu_700Bold',
  },
});
