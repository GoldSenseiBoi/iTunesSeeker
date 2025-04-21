import AsyncStorage from '@react-native-async-storage/async-storage';

export const signUp = async (email, password) => {
  const existing = await AsyncStorage.getItem('users');
  const users = existing ? JSON.parse(existing) : {};
  if (users[email]) throw new Error('User already exists');
  users[email] = password;
  await AsyncStorage.setItem('users', JSON.stringify(users));
  return true;
};

export const signIn = async (email, password) => {
  const existing = await AsyncStorage.getItem('users');
  const users = existing ? JSON.parse(existing) : {};
  if (users[email] === password) {
    await AsyncStorage.setItem('userToken', email);
    return true;
  }
  throw new Error('Invalid credentials');
};

export const signOut = async () => {
  await AsyncStorage.removeItem('userToken');
};
