import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
    FlatList, StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AlbumDetailScreen({ route }) {
  const { collectionId } = route.params;
  const [tracks, setTracks] = useState([]);
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Musiques de l'album</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.trackId.toString()}
        renderItem={({ item }) => (
          <View style={styles.trackItem}>
            <Text style={{ color: theme.text }}>{item.trackNumber}. {item.trackName}</Text>
            {item.previewUrl && (
              <>
                <TouchableOpacity onPress={() => playPreview(item.previewUrl)}>
                  <Text style={[styles.preview, { color: theme.highlight }]}>▶️ Écouter un extrait</Text>
                </TouchableOpacity>
                {playing && (
                  <TouchableOpacity onPress={pauseSound}>
                    <Text style={[styles.preview, { color: theme.highlight }]}>⏸ Pause</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  trackItem: { marginBottom: 16 },
  preview: { marginTop: 4, fontSize: 14 },
});
