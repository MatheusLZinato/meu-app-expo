import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PokemonListScreen from '../screens/PokemonListScreen';
import PokemonDetailScreen from '../screens/PokemonDetailScreen';
import GameScreen from '../screens/GameScreen';

// Criamos dois navegadores:
// Tab Navigator (abas embaixo) e Stack Navigator (telas empilhadas)
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack: Lista de Pokémon -> Detalhes do Pokémon
function UtilityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#e63946' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="PokemonList"
        component={PokemonListScreen}
        options={{ title: 'Pokédex' }}
      />
      <Stack.Screen
        name="PokemonDetail"
        component={PokemonDetailScreen}
        options={{ title: 'Detalhes' }}
      />
    </Stack.Navigator>
  );
}

// Tab: alterna entre área Utilitária (Pokédex) e Jogo
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#e63946',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingTop: 6,
          paddingBottom: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Utilitário"
        component={UtilityStack}
        options={{
          tabBarLabel: 'Pokédex',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Jogo"
        component={GameScreen}
        options={{
          tabBarLabel: 'Jogo',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🎮</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
