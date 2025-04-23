import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggleScreen() {
  const { dark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: dark ? '#333' : '#f5f5f5' }]}>
      <TouchableOpacity 
        onPress={toggleTheme}
        style={[
          styles.button,
          { backgroundColor: dark ? '#6200EE' : '#FFD700' }
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {dark ? '🌞 Mode Clair' : '🌙 Mode Sombre'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});