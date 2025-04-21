import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function AlbumDetailScreen({ route }) {
  const { collectionId } = route.params;
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchTracks = async () => {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${collectionId}&entity=song`);
      const json = await res.json();
      const songs = json.results.filter(item => item.wrapperType === 'track');
      setTracks(songs);
    };
    fetchTracks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Musiques de l'album</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.trackId.toString()}
        renderItem={({ item }) => (
          <View style={styles.trackItem}>
            <Text>{item.trackNumber}. {item.trackName}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  trackItem: { marginBottom: 8 },
});
