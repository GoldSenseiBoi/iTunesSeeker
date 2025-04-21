import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    FlatList, Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

const keywords = ['rap', 'rock', 'love', 'summer', 'hiphop', 'pop', 'electro'];

export default function HomeScreen() {
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchAlbums = async () => {
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      const response = await fetch(`https://itunes.apple.com/search?term=${randomKeyword}&entity=album`);
      const json = await response.json();
      setAlbums(json.results);
    };

    fetchAlbums();
  }, []);

  useEffect(() => {
    const loadPlaylists = async () => {
      const data = await AsyncStorage.getItem('playlists');
      setPlaylists(data ? JSON.parse(data) : []);
    };
    loadPlaylists();
  }, [isFocused]);

  const renderAlbum = ({ item }) => (
    <TouchableOpacity
      style={styles.albumContainer}
      onPress={() => navigation.navigate('AlbumDetail', { collectionId: item.collectionId })}
    >
      <Image source={{ uri: item.artworkUrl100 }} style={styles.albumImage} />
      <Text style={styles.albumTitle} numberOfLines={1}>{item.collectionName}</Text>
    </TouchableOpacity>
  );

  const renderPlaylist = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.playlistImage} />
      <Text style={styles.playlistTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Bienvenue sur iTunes Seeker !</Text>

      <Text style={styles.subheader}>Sélection aléatoire :</Text>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.collectionId.toString()}
        renderItem={renderAlbum}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Text style={styles.subheader}>Mes playlists</Text>
      {playlists.length === 0 ? (
        <Text style={styles.noPlaylist}>Aucune playlist pour l’instant</Text>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={renderPlaylist}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subheader: { fontSize: 18, marginBottom: 10 },
  albumContainer: { marginRight: 12, alignItems: 'center', width: 120 },
  albumImage: { width: 100, height: 100, borderRadius: 8 },
  albumTitle: { marginTop: 6, textAlign: 'center', fontSize: 14 },
  noPlaylist: { fontStyle: 'italic', color: '#888', marginBottom: 20 },
  playlistItem: { marginRight: 12, alignItems: 'center' },
  playlistImage: { width: 100, height: 100, borderRadius: 8 },
  playlistTitle: { marginTop: 6, textAlign: 'center', fontSize: 14 },
});
