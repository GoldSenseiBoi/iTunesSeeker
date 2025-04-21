import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggleScreen() {
  const { dark, toggleTheme } = useTheme();

  return (
    <View style={styles.container}>
      <Button title={dark ? 'Passer en clair 🌞' : 'Passer en sombre 🌙'} onPress={toggleTheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
