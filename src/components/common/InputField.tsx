import React from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export default function InputField({ label, error, required, style, ...props }: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#C8BDB0"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    marginBottom: 6,
  },
  required: {
    color: '#E88D67',
  },
  input: {
    backgroundColor: '#FFFFF8',
    borderWidth: 1.5,
    borderColor: '#E8DDD0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#5D4E3C',
    fontFamily: 'Gaegu_400Regular',
  },
  inputError: {
    borderColor: '#E88D67',
  },
  errorText: {
    fontSize: 12,
    color: '#E88D67',
    marginTop: 4,
    fontFamily: 'Gaegu_400Regular',
  },
});
