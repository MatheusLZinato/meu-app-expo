import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import axios from 'axios';

import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

// Tela que lista Pokémon vindos da PokeAPI
// Demonstra: useState, useEffect, Axios, FlatList, tratamento de erros
export default function PokemonListScreen({ navigation }) {
  // useState para guardar a lista, o status de carregando e erros
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // useEffect roda quando a tela é montada (uma vez só)
  useEffect(() => {
    fetchPokemons();
  }, []);

  // Função que busca os Pokémon na API
  const fetchPokemons = async () => {
    try {
      setError(null);
      const response = await axios.get(
        'https://pokeapi.co/api/v2/pokemon?limit=20'
      );

      // Montamos a lista com nome + URL para detalhes + imagem
      const list = response.data.results.map((p, index) => ({
        id: index + 1,
        name: p.name,
        url: p.url,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
      }));

      setPokemons(list);
    } catch (err) {
      // Tratamento de erro: a API pode estar fora, sem internet, etc.
      setError('Não foi possível carregar os Pokémon. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPokemons();
  };

  // Enquanto carrega, mostra um spinner
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e63946" />
        <Text style={styles.loadingText}>Carregando Pokémon...</Text>
      </View>
    );
  }

  // Se deu erro, mostra mensagem e botão para tentar novamente
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Tentar novamente" onPress={fetchPokemons} />
      </View>
    );
  }

  // Tela normal: lista os Pokémon usando FlatList
  return (
    <View style={styles.container}>
      <Header title="Pokédex" subtitle="Toque em um Pokémon para jogar com ele!" />
      <FlatList
        data={pokemons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card
            title={`#${item.id} ${item.name}`}
            imageUrl={item.image}
            onPress={() =>
              navigation.navigate('PokemonDetail', { pokemon: item })
            }
          />
        )}
        contentContainerStyle={{ paddingVertical: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e63946']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: { marginTop: 12, color: '#666', fontSize: 16 },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorText: {
    color: '#e63946',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
