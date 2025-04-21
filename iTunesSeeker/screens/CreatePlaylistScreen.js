import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CreatePlaylistScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Création de Playlist (à venir)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18 },
});
