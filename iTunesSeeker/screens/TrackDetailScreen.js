import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
    Image, Modal, Pressable,
    StyleSheet, Text, TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function TrackDetailScreen({ route, navigation }) {
  const { track } = route.params;
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [rating, setRating] = useState(0);
  const [allRatings, setAllRatings] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    const loadRatings = async () => {
      const data = await AsyncStorage.getItem('ratings');
      const parsed = data ? JSON.parse(data) : {};
      setAllRatings(parsed);
      if (parsed[track.trackId]) {
        setRating(parsed[track.trackId]);
      }
    };
    loadRatings();
  }, []);

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const playPreview = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: track.previewUrl });
    setSound(newSound);
    setPlaying(true);
    await newSound.playAsync();
  };

  const pausePreview = async () => {
    if (sound) {
      await sound.pauseAsync();
      setPlaying(false);
    }
  };

  const handleSetRating = async (value) => {
    const newRatings = { ...allRatings, [track.trackId]: value };
    setRating(value);
    setAllRatings(newRatings);
    await AsyncStorage.setItem('ratings', JSON.stringify(newRatings));
  };

  const openModal = async () => {
    const data = await AsyncStorage.getItem('playlists');
    setPlaylists(data ? JSON.parse(data) : []);
    setModalVisible(true);
  };

  const addToPlaylist = async (playlistId) => {
    const data = await AsyncStorage.getItem('playlists');
    const all = data ? JSON.parse(data) : [];
    const updated = all.map((p) => {
      if (p.id === playlistId) {
        if (!p.songs) p.songs = [];
        const exists = p.songs.find(s => s.trackId === track.trackId);
        if (!exists) p.songs.push(track);
      }
      return p;
    });
    await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={{ uri: track.artworkUrl100 }} style={styles.image} />
      <Text style={[styles.title, { color: theme.text }]}>{track.trackName}</Text>
      <Text style={[styles.artist, { color: theme.subtext }]}>{track.artistName}</Text>
      <Text style={[styles.info, { color: theme.subtext }]}>Genre : {track.primaryGenreName}</Text>
      <Text style={[styles.info, { color: theme.subtext }]}>
        Album : <Text style={{ textDecorationLine: 'underline' }}>{track.collectionName}</Text>
      </Text>
      <Text style={[styles.info, { color: theme.subtext }]}>
        Année : {new Date(track.releaseDate).getFullYear()}
      </Text>

      {track.previewUrl && (
        <TouchableOpacity onPress={playing ? pausePreview : playPreview}>
          <Text style={[styles.playBtn, { color: theme.highlight }]}>
            {playing ? '⏸ Pause' : '▶️ Écouter un extrait'}
          </Text>
        </TouchableOpacity>
      )}

      {/* ⭐ Notation */}
      <Text style={[styles.ratingText, { color: theme.text }]}>Ta note :</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((val) => (
          <TouchableOpacity key={val} onPress={() => handleSetRating(val)}>
            <Text style={{ fontSize: 24, color: val <= rating ? '#FFD700' : theme.subtext }}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={openModal} style={styles.addBtn}>
        <Text style={{ color: theme.highlight }}>➕ Ajouter à une playlist</Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Ajouter à :</Text>
            {playlists.length === 0 ? (
              <Text style={{ color: theme.subtext }}>Aucune playlist</Text>
            ) : (
              playlists.map((pl) => (
                <Pressable key={pl.id} onPress={() => addToPlaylist(pl.id)}>
                  <Text style={[styles.modalItem, { color: theme.text }]}>{pl.name}</Text>
                </Pressable>
              ))
            )}
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'red', marginTop: 12 }}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  artist: { fontSize: 18, marginBottom: 8 },
  info: { fontSize: 14, marginBottom: 4 },
  playBtn: { marginVertical: 16, fontSize: 16 },
  ratingText: { marginTop: 10 },
  stars: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  addBtn: { alignItems: 'center', marginTop: 12 },
  modalOverlay: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#00000088',
  },
  modalContent: {
    padding: 24, borderRadius: 10, width: '80%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalItem: { fontSize: 16, padding: 8 },
});
