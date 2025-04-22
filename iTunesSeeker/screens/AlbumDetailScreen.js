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
    <View style={[styles.item, { backgroundColor: theme.card, borderRadius: 12 }]}>
      <Image 
        source={{ uri: item.artworkUrl60 }} 
        style={[styles.thumb, { borderColor: theme.border }]} 
      />
      <View style={styles.trackInfo}>
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
      <View style={styles.actions}>
        {item.previewUrl && (
          <TouchableOpacity 
            onPress={() => togglePreview(item)}
            style={styles.actionButton}
          >
            <Text style={[styles.playBtn, { color: theme.highlight }]}>
              {playingId === item.trackId ? '⏸' : '▶️'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          onPress={() => openModal(item)}
          style={styles.actionButton}
        >
          <Text style={[styles.addBtn, { color: theme.highlight }]}>➕</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('TrackDetail', { track: item })}
          style={styles.actionButton}
        >
          <Text style={[styles.detailBtn, { color: theme.highlight }]}>ℹ️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Album Tracks</Text>
      
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.trackId.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: theme.modalBackground,
            shadowColor: theme.shadow
          }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Add to Playlist
            </Text>
            
            {playlists.length === 0 ? (
              <Text style={[styles.noPlaylists, { color: theme.subtext }]}>
                No playlists available
              </Text>
            ) : (
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Pressable 
                    onPress={() => addToPlaylist(item.id)}
                    style={({ pressed }) => [
                      styles.modalItemContainer,
                      { opacity: pressed ? 0.6 : 1 }
                    ]}
                  >
                    <Text style={[styles.modalItem, { color: theme.text }]}>
                      {item.name}
                    </Text>
                  </Pressable>
                )}
                style={styles.playlistList}
              />
            )}
            
            <Pressable 
              onPress={() => setModalVisible(false)}
              style={({ pressed }) => [
                styles.modalCancelContainer,
                { opacity: pressed ? 0.6 : 1 }
              ]}
            >
              <Text style={[styles.modalCancel, { color: theme.error }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 24 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20,
    marginLeft: 4
  },
  listContent: {
    paddingBottom: 20
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  trackInfo: {
    flex: 1,
    marginRight: 10
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    borderWidth: 0.5
  },
  name: { 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 2 
  },
  artist: { 
    fontSize: 14,
    marginBottom: 2
  },
  year: { 
    fontSize: 12,
    opacity: 0.8
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionButton: {
    padding: 8
  },
  playBtn: {
    fontSize: 20,
  },
  addBtn: {
    fontSize: 20,
  },
  detailBtn: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 16,
    width: '85%',
    maxHeight: '60%',
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20,
    textAlign: 'center'
  },
  playlistList: {
    width: '100%',
    maxHeight: '70%'
  },
  modalItemContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)'
  },
  modalItem: { 
    fontSize: 16,
    textAlign: 'center'
  },
  noPlaylists: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16
  },
  modalCancelContainer: {
    marginTop: 20,
    padding: 10,
    alignSelf: 'center'
  },
  modalCancel: { 
    fontSize: 16,
    fontWeight: '600'
  },
});