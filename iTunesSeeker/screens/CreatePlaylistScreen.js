import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CreatePlaylistScreen({ navigation }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const { theme } = useTheme();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

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

      <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
        <Text style={{ color: theme.highlight }}>
          {image ? '📷 Modifier l’image' : '📷 Choisir une image'}
        </Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.preview} />}

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
  imageButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    alignItems: 'center',
    marginBottom: 12,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
});
