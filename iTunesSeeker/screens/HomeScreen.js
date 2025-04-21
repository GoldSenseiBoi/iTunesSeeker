import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const keywords = ['rap', 'rock', 'love', 'summer', 'hiphop', 'pop', 'electro'];

export default function HomeScreen() {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      const response = await fetch(`https://itunes.apple.com/search?term=${randomKeyword}&entity=album`);
      const json = await response.json();
      setAlbums(json.results);
    };

    fetchAlbums();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.albumContainer}>
      <Image source={{ uri: item.artworkUrl100 }} style={styles.albumImage} />
      <Text style={styles.albumTitle} numberOfLines={1}>{item.collectionName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bienvenue sur iTunes Seeker !</Text>
      <Text style={styles.subheader}>Sélection aléatoire :</Text>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.collectionId.toString()}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subheader: { fontSize: 18, marginBottom: 10 },
  albumContainer: { marginRight: 12, alignItems: 'center', width: 120 },
  albumImage: { width: 100, height: 100, borderRadius: 8 },
  albumTitle: { marginTop: 6, textAlign: 'center', fontSize: 14 },
});
