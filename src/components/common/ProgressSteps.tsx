import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <View
              style={[
                styles.dot,
                index <= currentStep && styles.dotActive,
                index === currentStep && styles.dotCurrent,
              ]}
            />
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.line,
                  index < currentStep && styles.lineActive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.labelsRow}>
        {steps.map((label, index) => (
          <Text
            key={index}
            style={[
              styles.label,
              index === currentStep && styles.labelActive,
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8DDD0',
  },
  dotActive: {
    backgroundColor: '#E88D67',
  },
  dotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#E88D67',
    backgroundColor: '#FFF0E5',
  },
  line: {
    width: 30,
    height: 2,
    backgroundColor: '#E8DDD0',
    marginHorizontal: 4,
  },
  lineActive: {
    backgroundColor: '#E88D67',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 11,
    color: '#B0A090',
    fontFamily: 'Gaegu_400Regular',
    textAlign: 'center',
    flex: 1,
  },
  labelActive: {
    color: '#E88D67',
    fontFamily: 'Gaegu_700Bold',
  },
});
