import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // ⬅️ en haut du fichier
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const { theme } = useTheme();
  const navigation = useNavigation(); // ⬅️ dans le composant

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const search = async () => {
    if (!query) return;
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song`);
    const json = await res.json();
    setResults(json.results);
  };

  const openModal = async (track) => {
    const data = await AsyncStorage.getItem('playlists');
    setPlaylists(data ? JSON.parse(data) : []);
    setSelectedTrack(track);
    setModalVisible(true);
  };

  const addToPlaylist = async (playlistId) => {
    const data = await AsyncStorage.getItem('playlists');
    const all = data ? JSON.parse(data) : [];
    const updated = all.map((p) => {
      if (p.id === playlistId) {
        if (!p.songs) p.songs = [];
        const exists = p.songs.find(s => s.trackId === selectedTrack.trackId);
        if (!exists) p.songs.push(selectedTrack);
      }
      return p;
    });
    await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    setModalVisible(false);
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

  const renderTrack = ({ item }) => (
    <View style={styles.trackItem}>
      <Image source={{ uri: item.artworkUrl100 }} style={styles.trackImage} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.trackTitle, { color: theme.text }]} numberOfLines={1}>
          {item.trackName}
        </Text>
        <Text style={[styles.trackArtist, { color: theme.subtext }]} numberOfLines={1}>
          {item.artistName}
        </Text>
        <Text style={[styles.trackYear, { color: theme.subtext }]}>
          {new Date(item.releaseDate).getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => openModal(item)}>
          <Text style={[styles.add, { color: theme.highlight }]}>➕ Ajouter à une playlist</Text>
        </TouchableOpacity>
      </View>
  
      {item.previewUrl && (
        <TouchableOpacity onPress={() => togglePreview(item)}>
          <Text style={[styles.playBtn, { color: theme.highlight }]}>
            {playingId === item.trackId ? '⏸' : '▶️'}
          </Text>
        </TouchableOpacity>
      )}
  
      <TouchableOpacity onPress={() => navigation.navigate('TrackDetail', { track: item })}>
        <Text style={[styles.detailBtn, { color: theme.highlight }]}>ℹ️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput
        placeholder="Rechercher une musique..."
        style={[styles.input, { color: theme.text, borderColor: theme.subtext }]}
        placeholderTextColor={theme.subtext}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={search}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.trackId.toString()}
        renderItem={renderTrack}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Choisir une playlist</Text>
            {playlists.length === 0 ? (
              <Text style={{ color: theme.subtext }}>Aucune playlist disponible</Text>
            ) : (
              playlists.map((pl) => (
                <Pressable key={pl.id} onPress={() => addToPlaylist(pl.id)}>
                  <Text style={[styles.modalItem, { color: theme.text }]}>{pl.name}</Text>
                </Pressable>
              ))
            )}
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalCancel, { color: 'red' }]}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40 },
  input: { borderWidth: 1, padding: 10, borderRadius: 6, marginBottom: 16 },
  trackItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  trackImage: { width: 60, height: 60, borderRadius: 6, marginRight: 12 },
  trackTitle: { fontWeight: 'bold', fontSize: 16 },
  trackArtist: { fontSize: 14 },
  trackYear: { fontSize: 12 },
  playBtn: { fontSize: 18, marginLeft: 10 },
  add: { marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalItem: { padding: 10, fontSize: 16 },
  modalCancel: { marginTop: 20 },
});
