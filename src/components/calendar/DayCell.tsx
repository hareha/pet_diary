import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';



interface DayCellProps {
  day: number | null;
  date: string;
  isToday: boolean;
  isSelected: boolean;
  thumbnailUri?: string;
  onPress: (date: string) => void;
}

export default function DayCell({
  day,
  date,
  isToday,
  isSelected,
  thumbnailUri,
  onPress,
}: DayCellProps) {
  if (day === null) {
    return <View style={styles.cell} />;
  }

  return (
    <TouchableOpacity
      style={styles.cell}
      onPress={() => onPress(date)}
      activeOpacity={0.7}
    >
      {thumbnailUri ? (
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.photo}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.emptyDay, isToday && styles.todayEmpty]} />
      )}
      <View style={[styles.dayBadge, thumbnailUri ? styles.dayBadgeOnPhoto : null]}>
        <Text
          style={[
            styles.dayText,
            isToday && styles.todayText,
            thumbnailUri && styles.dayTextOnPhoto,
          ]}
        >
          {day}
        </Text>
      </View>
      {isSelected && <View style={styles.selectedBorder} />}
      {isToday && !thumbnailUri && <View style={styles.todayDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    margin: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  emptyDay: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5EFE8',
  },
  todayEmpty: {
    backgroundColor: '#FFEEDD',
  },
  dayBadge: {
    position: 'absolute',
    bottom: 1,
    right: 2,
  },
  dayBadgeOnPhoto: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 0.5,
  },
  dayText: {
    fontSize: 9,
    color: '#A09080',
    fontFamily: 'Gaegu_400Regular',
  },
  todayText: {
    color: '#E88D67',
    fontFamily: 'Gaegu_700Bold',
  },
  dayTextOnPhoto: {
    color: '#FFFFFF',
  },
  selectedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#E88D67',
    borderRadius: 3,
  },
  todayDot: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E88D67',
  },
});
