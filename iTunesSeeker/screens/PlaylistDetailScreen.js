import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PlaylistDetailScreen({ route }) {
  const { playlistId } = route.params;
  const [playlist, setPlaylist] = useState(null);
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem('playlists');
      const all = data ? JSON.parse(data) : [];
      const found = all.find((p) => p.id === playlistId);
      setPlaylist(found || null);
    };
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playPreview = async (url) => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
    setSound(newSound);
    await newSound.playAsync();
    setPlaying(true);
  };

  const pauseSound = async () => {
    if (sound && playing) {
      await sound.pauseAsync();
      setPlaying(false);
    }
  };

  const deletePlaylist = async () => {
    const data = await AsyncStorage.getItem('playlists');
    const all = data ? JSON.parse(data) : [];
    const updated = all.filter((p) => p.id !== playlistId);
    await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    navigation.navigate('Home');
  };

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Playlist introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: playlist.image }} style={styles.image} />
      <Text style={styles.title}>{playlist.name}</Text>

      <TouchableOpacity onPress={deletePlaylist}>
        <Text style={styles.delete}>🗑 Supprimer la playlist</Text>
      </TouchableOpacity>

      {playlist.songs?.length ? (
        <FlatList
          data={playlist.songs}
          keyExtractor={(item) => item.trackId.toString()}
          renderItem={({ item }) => (
            <View style={styles.songItem}>
              <Text>{item.trackName}</Text>
              {item.previewUrl && (
                <>
                  <TouchableOpacity onPress={() => playPreview(item.previewUrl)}>
                    <Text style={styles.preview}>▶️ Écouter un extrait</Text>
                  </TouchableOpacity>
                  {playing && (
                    <TouchableOpacity onPress={pauseSound}>
                      <Text style={styles.preview}>⏸ Pause</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        />
      ) : (
        <Text style={styles.empty}>Aucune musique dans cette playlist</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  image: { width: '100%', height: 200, borderRadius: 8 },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 16 },
  delete: { color: 'red', textAlign: 'center', marginBottom: 16, fontWeight: 'bold' },
  songItem: { marginBottom: 16 },
  empty: { color: '#888', fontStyle: 'italic' },
  error: { textAlign: 'center', marginTop: 40, fontSize: 16, color: 'red' },
  preview: { color: '#1E90FF', marginTop: 4 },
});
