import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface ChipSelectorProps {
  label?: string;
  items: { id: string; label: string; emoji?: string }[];
  selected: string | string[];
  onSelect: (id: string) => void;
  multiple?: boolean;
  required?: boolean;
}

export default function ChipSelector({
  label,
  items,
  selected,
  onSelect,
  multiple = false,
  required = false,
}: ChipSelectorProps) {
  const isSelected = (id: string) => {
    if (Array.isArray(selected)) return selected.includes(id);
    return selected === id;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={styles.chipContainer}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.chip, isSelected(item.id) && styles.chipSelected]}
            onPress={() => onSelect(item.id)}
            activeOpacity={0.7}
          >
            {item.emoji ? (
              <Text style={styles.chipEmoji}>{item.emoji}</Text>
            ) : null}
            <Text style={[styles.chipText, isSelected(item.id) && styles.chipTextSelected]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Gaegu_700Bold',
    color: '#5D4E3C',
    marginBottom: 8,
  },
  required: {
    color: '#E88D67',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5EDE4',
    borderWidth: 1.5,
    borderColor: '#E8DDD0',
  },
  chipSelected: {
    backgroundColor: '#FFF0E5',
    borderColor: '#E88D67',
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  chipText: {
    fontSize: 14,
    color: '#8C7B6B',
    fontFamily: 'Gaegu_700Bold',
  },
  chipTextSelected: {
    color: '#E88D67',
  },
});
