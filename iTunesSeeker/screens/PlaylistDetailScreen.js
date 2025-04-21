import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

export default function PlaylistDetailScreen({ route }) {
  const { playlistId } = route.params;
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem('playlists');
      const all = data ? JSON.parse(data) : [];
      const found = all.find(p => p.id === playlistId);
      setPlaylist(found || null);
    };
    load();
  }, []);

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
      {playlist.songs?.length ? (
        <FlatList
          data={playlist.songs}
          keyExtractor={(item) => item.trackId.toString()}
          renderItem={({ item }) => (
            <View style={styles.songItem}>
              <Text>{item.trackName}</Text>
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
  songItem: { marginBottom: 12 },
  empty: { color: '#888', fontStyle: 'italic' },
  error: { textAlign: 'center', marginTop: 40, fontSize: 16, color: 'red' },
});
