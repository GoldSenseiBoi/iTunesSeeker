import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    Alert,
    Button, StyleSheet,
    Text, TextInput,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CreatePlaylistScreen({ navigation }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const { theme } = useTheme();

  const handleSave = async () => {
    if (!name || !image) {
      Alert.alert('Erreur', 'Nom et image requis');
      return;
    }

    const newPlaylist = {
      id: Date.now().toString(),
      name,
      image,
      songs: [],
    };

    const existing = await AsyncStorage.getItem('playlists');
    const playlists = existing ? JSON.parse(existing) : [];
    playlists.push(newPlaylist);
    await AsyncStorage.setItem('playlists', JSON.stringify(playlists));

    Alert.alert('Succès', 'Playlist créée');
    navigation.navigate('Home');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Créer une playlist</Text>
      <TextInput
        placeholder="Nom de la playlist"
        value={name}
        onChangeText={setName}
        style={[styles.input, { color: theme.text, borderColor: theme.subtext }]}
        placeholderTextColor={theme.subtext}
      />
      <TextInput
        placeholder="URL de l’image"
        value={image}
        onChangeText={setImage}
        style={[styles.input, { color: theme.text, borderColor: theme.subtext }]}
        placeholderTextColor={theme.subtext}
      />
      <Button title="Créer" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    borderRadius: 5,
  },
});
