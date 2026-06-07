import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

export default function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrevMonth} style={styles.arrowBtn}>
        <Text style={styles.arrow}>{'‹'}</Text>
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        <Text style={styles.year}>{year}년</Text>
        <Text style={styles.month}>{MONTH_NAMES[month - 1]}</Text>
      </View>
      <TouchableOpacity onPress={onNextMonth} style={styles.arrowBtn}>
        <Text style={styles.arrow}>{'›'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,183,149,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 28,
    color: '#E88D67',
    fontWeight: '600',
    marginTop: -2,
  },
  titleWrap: {
    alignItems: 'center',
  },
  year: {
    fontSize: 14,
    color: '#B0A090',
    marginBottom: 2,
    fontFamily: 'Gaegu_400Regular',
  },
  month: {
    fontSize: 26,
    fontFamily: 'Gaegu_700Bold',
    color: '#5D4E3C',
  },
});
