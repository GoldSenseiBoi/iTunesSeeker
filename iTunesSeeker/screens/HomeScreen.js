import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { signOut } from '../utils/auth';

export default function HomeScreen({ setIsLoggedIn }) {
  const logout = async () => {
    await signOut();
    setIsLoggedIn(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenue sur iTunes Seeker !</Text>
      <Button title="Déconnexion" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, marginBottom: 20 },
});
