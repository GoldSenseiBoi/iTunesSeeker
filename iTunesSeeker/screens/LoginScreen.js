import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { signIn, signOut, signUp } from '../utils/auth';

export default function LoginScreen({ setIsLoggedIn, logoutOnly }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (logoutOnly) {
      signOut().then(() => setIsLoggedIn(false));
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    try {
      await signIn(email, password);
      setIsLoggedIn(true);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    try {
      await signUp(email, password);
      await signIn(email, password);
      setIsLoggedIn(true);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iTunes Seeker</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <Button title="Connexion" onPress={handleLogin} />
      <Button title="Créer un compte" onPress={handleSignUp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, marginBottom: 12, padding: 8, borderRadius: 4 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
});
