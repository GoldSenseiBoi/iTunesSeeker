import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import CreatePlaylistScreen from '../screens/CreatePlaylistScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

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
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Create" component={CreatePlaylistScreen} />
      <Tab.Screen name="Logout">
        {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} logoutOnly />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
