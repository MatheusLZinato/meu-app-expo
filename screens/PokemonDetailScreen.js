import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';

import Button from '../components/Button';

// Tela de detalhes - acessada via Stack Navigator
// Recebe o Pokémon via route.params (passado pela tela anterior)
export default function PokemonDetailScreen({ route, navigation }) {
  const { pokemon } = route.params;

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.get(pokemon.url);
      setDetails(response.data);
    } catch (err) {
      setError('Erro ao buscar detalhes do Pokémon.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e63946" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error || 'Sem dados disponíveis'}</Text>
        <Button title="Tentar novamente" onPress={fetchDetails} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageBox}>
        <Image source={{ uri: pokemon.image }} style={styles.image} />
      </View>

      <Text style={styles.name}>
        #{details.id} {details.name}
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Altura</Text>
          <Text style={styles.value}>{details.height / 10} m</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Peso</Text>
          <Text style={styles.value}>{details.weight / 10} kg</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Exp. base</Text>
          <Text style={styles.value}>{details.base_experience}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.sectionTitle}>Tipos</Text>
        <View style={styles.chipsContainer}>
          {details.types.map((t, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{t.type.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.sectionTitle}>Habilidades</Text>
        {details.abilities.map((a, i) => (
          <Text key={i} style={styles.bullet}>
            • {a.ability.name}
          </Text>
        ))}
      </View>

      <Button title="← Voltar para a lista" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  imageBox: {
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 10,
    elevation: 4,
    marginBottom: 12,
  },
  image: { width: 180, height: 180 },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1d3557',
    textTransform: 'capitalize',
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginVertical: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e63946',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: { fontSize: 15, color: '#666' },
  value: { fontSize: 15, color: '#1d3557', fontWeight: '600' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: '#1d3557',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  chipText: {
    color: '#fff',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  bullet: {
    fontSize: 15,
    color: '#333',
    textTransform: 'capitalize',
    marginVertical: 3,
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
