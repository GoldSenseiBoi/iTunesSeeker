import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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

  // Format duration from milliseconds to minutes:seconds
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Image 
          source={{ uri: track.artworkUrl100.replace('100x100bb', '300x300bb') }} 
          style={styles.image} 
        />
        
        <View style={styles.trackInfo}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {track.trackName}
          </Text>
          <Text style={[styles.artist, { color: theme.highlight }]} numberOfLines={1}>
            {track.artistName}
          </Text>
          
          {track.previewUrl && (
            <TouchableOpacity 
              onPress={playing ? pausePreview : playPreview}
              style={[styles.playButton, { backgroundColor: theme.highlight }]}
            >
              <Ionicons 
                name={playing ? 'pause' : 'play'} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.playButtonText}>
                {playing ? 'Pause' : 'Écouter un extrait'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.detailsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Informations</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="musical-notes" size={18} color={theme.subtext} />
          <Text style={[styles.detailText, { color: theme.subtext }]}>
            Genre : {track.primaryGenreName}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="disc" size={18} color={theme.subtext} />
          <Text style={[styles.detailText, { color: theme.subtext }]}>
            Album : {track.collectionName}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={18} color={theme.subtext} />
          <Text style={[styles.detailText, { color: theme.subtext }]}>
            Sortie : {new Date(track.releaseDate).toLocaleDateString()}
          </Text>
        </View>
        
        {track.trackTimeMillis && (
          <View style={styles.detailRow}>
            <MaterialIcons name="timer" size={18} color={theme.subtext} />
            <Text style={[styles.detailText, { color: theme.subtext }]}>
              Durée : {formatDuration(track.trackTimeMillis)}
            </Text>
          </View>
        )}
        
        {track.trackPrice && (
          <View style={styles.detailRow}>
            <FontAwesome name="dollar" size={18} color={theme.subtext} />
            <Text style={[styles.detailText, { color: theme.subtext }]}>
              Prix : {track.trackPrice} {track.currency}
            </Text>
          </View>
        )}
      </View>

      {/* Rating Section */}
      <View style={styles.ratingSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Votre évaluation</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((val) => (
            <TouchableOpacity key={val} onPress={() => handleSetRating(val)}>
              <FontAwesome 
                name={val <= rating ? 'star' : 'star-o'} 
                size={32} 
                color={val <= rating ? '#FFD700' : theme.subtext} 
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.ratingText, { color: theme.subtext }]}>
          {rating > 0 ? `Vous avez noté ${rating} étoile${rating > 1 ? 's' : ''}` : 'Non noté'}
        </Text>
      </View>

      {/* Playlist Section */}
      <TouchableOpacity 
        onPress={openModal} 
        style={[styles.playlistButton, { borderColor: theme.highlight }]}
      >
        <Ionicons name="add-circle-outline" size={24} color={theme.highlight} />
        <Text style={[styles.playlistButtonText, { color: theme.highlight }]}>
          Ajouter à une playlist
        </Text>
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
            <Text style={[styles.modalTitle, { color: theme.text }]}>Ajouter à une playlist</Text>
            
            {playlists.length === 0 ? (
              <View style={styles.emptyPlaylists}>
                <Ionicons name="musical-notes" size={48} color={theme.subtext} />
                <Text style={[styles.emptyText, { color: theme.subtext }]}>
                  Aucune playlist disponible
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.playlistList}>
                {playlists.map((pl) => (
                  <Pressable 
                    key={pl.id} 
                    onPress={() => addToPlaylist(pl.id)}
                    style={({ pressed }) => [
                      styles.playlistItem,
                      { backgroundColor: pressed ? theme.background : 'transparent' }
                    ]}
                  >
                    <Ionicons name="list" size={20} color={theme.text} />
                    <Text style={[styles.playlistItemText, { color: theme.text }]}>
                      {pl.name} ({pl.songs?.length || 0} titres)
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            
            <Pressable 
              onPress={() => setModalVisible(false)}
              style={[styles.modalCloseButton, { backgroundColor: theme.highlight }]}
            >
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 25,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 20,
  },
  trackInfo: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  artist: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: '600',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginTop: 10,
    width: '90%',
  },
  playButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  detailsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 15,
    marginLeft: 10,
  },
  ratingSection: {
    marginBottom: 25,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
  playlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  playlistButtonText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyPlaylists: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
  },
  playlistList: {
    maxHeight: 300,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  playlistItemText: {
    fontSize: 16,
    marginLeft: 10,
  },
  modalCloseButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});