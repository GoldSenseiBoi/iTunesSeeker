import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  FlatList, Image, Modal, Pressable,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function PlaylistDetailScreen({ route }) {
  const { playlistId } = route.params;
  const [playlist, setPlaylist] = useState(null);
  const [sound, setSound] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState(null);
  const navigation = useNavigation();
  const { theme } = useTheme();

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem('playlists');
      const all = data ? JSON.parse(data) : [];
      const found = all.find((p) => p.id === playlistId);
      setPlaylist(found || null);
      setNewName(found?.name || '');
      setNewImage(found?.image || null);
    };
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setNewImage(result.assets[0].uri);
    }
  };

  const saveEdits = async () => {
    const data = await AsyncStorage.getItem('playlists');
    const all = data ? JSON.parse(data) : [];
    const updated = all.map(p => {
      if (p.id === playlistId) {
        return { ...p, name: newName, image: newImage };
      }
      return p;
    });
    await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    const refreshed = updated.find(p => p.id === playlistId);
    setPlaylist(refreshed);
    setEditVisible(false);
  };

  const deleteTrack = async (trackId) => {
    const data = await AsyncStorage.getItem('playlists');
    const all = data ? JSON.parse(data) : [];
    const updated = all.map((p) => {
      if (p.id === playlistId) {
        p.songs = p.songs.filter((s) => s.trackId !== trackId);
      }
      return p;
    });
    await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    const refreshed = updated.find((p) => p.id === playlistId);
    setPlaylist(refreshed);
  };

  const playPreview = async (url, id) => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
    setSound(newSound);
    setPlayingId(id);
    await newSound.playAsync();
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setPlayingId(null);
    }
  };

  const togglePreview = (item) => {
    if (playingId === item.trackId) {
      pauseSound();
    } else {
      playPreview(item.previewUrl, item.trackId);
    }
  };

  const deletePlaylist = async () => {
    const data = await AsyncStorage.getItem('playlists');
    const all = data ? JSON.parse(data) : [];
    const updated = all.filter((p) => p.id !== playlistId);
    await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    navigation.navigate('Home');
  };
  

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.artworkUrl60 }} style={styles.thumb} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {item.trackName}
        </Text>
        <Text style={[styles.artist, { color: theme.subtext }]} numberOfLines={1}>
          {item.artistName}
        </Text>
        <Text style={[styles.year, { color: theme.subtext }]}>
          {new Date(item.releaseDate).getFullYear()}
        </Text>
      </View>
  
      {item.previewUrl && (
        <TouchableOpacity onPress={() => togglePreview(item)}>
          <Text style={[styles.playBtn, { color: theme.highlight }]}>
            {playingId === item.trackId ? '⏸' : '▶️'}
          </Text>
        </TouchableOpacity>
      )}
  
      <TouchableOpacity onPress={() => deleteTrack(item.trackId)}>
        <Text style={[styles.removeBtn, { color: 'red' }]}>🗑</Text>
      </TouchableOpacity>
  
      <TouchableOpacity onPress={() => navigation.navigate('TrackDetail', { track: item })}>
        <Text style={[styles.detailBtn, { color: theme.highlight }]}>ℹ️</Text>
      </TouchableOpacity>
    </View>
  );
  

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Playlist introuvable</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={{ uri: playlist.image }} style={styles.image} />
      <Text style={[styles.title, { color: theme.text }]}>{playlist.name}</Text>

      <TouchableOpacity onPress={() => setEditVisible(true)}>
        <Text style={[styles.edit, { color: theme.highlight }]}>✏️ Modifier la playlist</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={deletePlaylist}>
        <Text style={styles.delete}>🗑 Supprimer la playlist</Text>
      </TouchableOpacity>


      {playlist.songs?.length ? (
        <FlatList
          data={playlist.songs}
          keyExtractor={(item) => item.trackId.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.empty}>Aucune musique dans cette playlist</Text>
      )}

      {/* MODAL */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Modifier la playlist</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              style={[styles.input, { color: theme.text, borderColor: theme.subtext }]}
              placeholder="Nom de la playlist"
              placeholderTextColor={theme.subtext}
            />
            <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
              <Text style={{ color: theme.highlight }}>
                {newImage ? '📷 Modifier l’image' : '📷 Choisir une image'}
              </Text>
            </TouchableOpacity>
            {newImage && (
              <Image source={{ uri: newImage }} style={styles.preview} />
            )}
            <Pressable onPress={saveEdits}>
              <Text style={[styles.save, { color: theme.highlight }]}>💾 Enregistrer</Text>
            </Pressable>
            <Pressable onPress={() => setEditVisible(false)}>
              <Text style={{ color: 'red' }}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  image: { width: '100%', height: 200, borderRadius: 8 },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 16 },
  edit: { textAlign: 'center', marginBottom: 16, fontWeight: 'bold' },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  thumb: { width: 55, height: 55, borderRadius: 8, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  artist: { fontSize: 14 },
  year: { fontSize: 12 },
  detailBtn: {
    fontSize: 20,
    marginLeft: 12,
  },delete: {
  color: 'red',
  textAlign: 'center',
  marginBottom: 16,
  fontWeight: 'bold',
},

  playBtn: { fontSize: 18, marginLeft: 8, fontWeight: 'bold' },
  removeBtn: { fontSize: 18, marginLeft: 12, fontWeight: 'bold' },
  empty: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  error: { textAlign: 'center', marginTop: 40, fontSize: 16, color: 'red' },

  // modal
  modalOverlay: { flex: 1, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 24, borderRadius: 10, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, width: '100%', padding: 10, borderRadius: 6, marginBottom: 12 },
  imageButton: {
    padding: 10, borderWidth: 1, borderRadius: 5, borderColor: '#ccc',
    alignItems: 'center', marginBottom: 12, width: '100%',
  },
  preview: { width: '100%', height: 150, borderRadius: 8, marginBottom: 16 },
  save: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
});
