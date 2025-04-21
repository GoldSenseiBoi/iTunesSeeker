import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const value = await AsyncStorage.getItem('darkMode');
      setDark(value === 'true');
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    await AsyncStorage.setItem('darkMode', (!dark).toString());
    setDark(!dark);
  };

  const theme = {
    background: dark ? '#121212' : '#ffffff',
    text: dark ? '#ffffff' : '#000000',
    subtext: dark ? '#cccccc' : '#555555',
    card: dark ? '#1e1e1e' : '#f0f0f0',
    highlight: '#1E90FF',
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
