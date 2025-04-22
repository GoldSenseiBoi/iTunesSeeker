import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { ThemeProvider } from './context/ThemeContext';
import TabNavigator from './navigation/TabNavigator';
import LoginScreen from './screens/LoginScreen';
import TrackDetailScreen from './screens/TrackDetailScreen'; // 👈 AJOUT

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
      setIsLoading(false);
    };
    checkLogin();
  }, []);

  if (isLoading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <>
              <Stack.Screen name="Home">
                {(props) => <TabNavigator {...props} setIsLoggedIn={setIsLoggedIn} />}
              </Stack.Screen>
              <Stack.Screen name="TrackDetail" component={TrackDetailScreen} />
              {/* 👆 Nouvelle route */}
            </>
          ) : (
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
