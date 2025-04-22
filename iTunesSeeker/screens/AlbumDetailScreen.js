import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AlbumDetailScreen({ route }) {
  const { collectionId } = route.params;
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [sound, setSound] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const navigation = useNavigation();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchTracks = async () => {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${collectionId}&entity=song`);
      const json = await res.json();
      const songs = json.results.filter(item => item.wrapperType === 'track');
      setTracks(songs);
    };
    fetchTracks();
  }, []);

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

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
      <TouchableOpacity onPress={() => openModal(item)}>
        <Text style={[styles.addBtn, { color: theme.highlight }]}>➕</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('TrackDetail', { track: item })}>
        <Text style={[styles.detailBtn, { color: theme.highlight }]}>ℹ️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Albums</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.trackId.toString()}
        renderItem={renderItem}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Ajouter à une playlist</Text>
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
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  thumb: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 12,
  },
  name: { fontSize: 16, fontWeight: '600' },
  artist: { fontSize: 14 },
  year: { fontSize: 12 },
  playBtn: {
    fontSize: 18,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  addBtn: {
    fontSize: 22,
    marginLeft: 12,
  },
  detailBtn: {
    fontSize: 20,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalItem: { padding: 10, fontSize: 16 },
  modalCancel: { marginTop: 20 },
});
