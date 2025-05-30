import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const keywords = [
  // Pop Internationale
  'Taylor Swift', 'Ed Sheeran', 'Ariana Grande', 'Justin Bieber', 'Harry Styles',
  'Lady Gaga', 'Bruno Mars', 'Katy Perry', 'Shawn Mendes', 'Camila Cabello',
  
  // R&B/Hip-Hop US
  'Drake', 'Post Malone', 'Kendrick Lamar', 'Cardi B', 'Nicki Minaj',
  'Megan Thee Stallion', 'Lil Nas X', 'Jack Harlow', 'Lizzo', 'Doja Cat',
  
  // Latino/Reggaeton
  'Bad Bunny', 'J Balvin', 'Maluma', 'Karol G', 'Anuel AA',
  'Ozuna', 'Daddy Yankee', 'Rauw Alejandro', 'Sech', 'Myke Towers',
  
  // K-Pop
  'BTS', 'BLACKPINK', 'TWICE', 'Stray Kids', 'EXO',
  'NCT 127', 'SEVENTEEN', 'ITZY', 'TXT', 'Red Velvet',
  
  // Français
  'Aya Nakamura', 'Jul', 'Ninho', 'Dadju', 'Soolking',
  'Nekfeu', 'Orelsan', 'Angèle', 'Maes', 'Gazo',
  
  // Rock/Alternatif
  'Coldplay', 'Imagine Dragons', 'Twenty One Pilots', 'Arctic Monkeys', 'Tame Impala',
  'The 1975', 'Muse', 'Foo Fighters', 'Red Hot Chili Peppers', 'Green Day'
];

export default function HomeScreen() {
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { theme } = useTheme();

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
      <Text style={[styles.albumTitle, { color: theme.text }]} numberOfLines={1}>
        {item.collectionName}
      </Text>
    </TouchableOpacity>
  );

  const renderPlaylist = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.playlistImage} />
      <Text style={[styles.playlistTitle, { color: theme.text }]} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={playlists}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      renderItem={renderPlaylist}
      ListEmptyComponent={
        <Text style={[styles.albumTitle, { color: theme.subtext }]}>Aucune playlist pour l’instant</Text>
      }
      ListHeaderComponent={
        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.headerText, { color: theme.text }]}>
            🎵 Découvre ta musique du moment
          </Text>

          <FlatList
            data={albums}
            horizontal
            keyExtractor={(item) => item.collectionId.toString()}
            renderItem={renderAlbum}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.albumList}
          />

          <Text style={[styles.sectionTitle, { color: theme.text }]}>📁 Tes playlists</Text>
        </View>
      }
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  albumList: {
    marginBottom: 24,
  },
  albumContainer: {
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  albumImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  albumTitle: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  playlistItem: {
    flex: 1,
    margin: 6,
    alignItems: 'center',
    backgroundColor: '#2222',
    padding: 10,
    borderRadius: 16,
  },
  playlistImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  playlistTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
