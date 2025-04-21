import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AlbumDetailScreen from '../screens/AlbumDetailScreen';
import CreatePlaylistScreen from '../screens/CreatePlaylistScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import ThemeToggleScreen from '../screens/ThemeToggleScreen';


const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: true, title: 'Accueil' }}
      />
      <HomeStack.Screen
        name="AlbumDetail"
        component={AlbumDetailScreen}
        options={{ title: 'Détail Album' }}
      />
      <HomeStack.Screen
        name="PlaylistDetail"
        component={PlaylistDetailScreen}
        options={{ title: 'Playlist' }}
        />
    </HomeStack.Navigator>
  );
}

export default function TabNavigator({ setIsLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'Create') iconName = 'add-circle';
          else if (route.name === 'Logout') iconName = 'log-out';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" children={() => <HomeStackNavigator />} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Create" component={CreatePlaylistScreen} />
      <Tab.Screen name="Theme" component={ThemeToggleScreen} />

      <Tab.Screen name="Logout">
        {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} logoutOnly />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
