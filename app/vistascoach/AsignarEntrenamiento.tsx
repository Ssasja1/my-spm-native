import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Atleta {
  id_atleta: number;
  nombre_completo: string;
}

// Cambia esta URL a la dirección de tu backend FastAPI
const BASE_URL =  'https://apifastpi-production.up.railway.app';

async function fetchAtletas(id_entrenador: number): Promise<Atleta[]> {
  const response = await fetch(`${BASE_URL}/coaches/${id_entrenador}/atletas`);
  if (!response.ok) throw new Error('Error al cargar atletas');
  const data = await response.json();
  console.log('fetchAtletas data:', data); // Para depurar
  return data; // Aquí data ya es un arreglo de atletas
}

export default function AsignarEntrenamiento() {
  const { id } = useLocalSearchParams(); // id_entrenamiento
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [idEntrenador, setIdEntrenador] = useState<number | null>(null);

  useEffect(() => {
    async function cargarAtletas() {
      try {
        const id_usuario = await AsyncStorage.getItem('user_id');
        console.log('id_usuario desde AsyncStorage:', id_usuario);
        if (!id_usuario) throw new Error('No se encontró usuario');

        const responseCoach = await fetch(`${BASE_URL}/coaches/${id_usuario}`);
        if (!responseCoach.ok) throw new Error('Error al obtener datos del coach');
        const coachData = await responseCoach.json();
        console.log('coachData:', coachData);
        setIdEntrenador(coachData.id_entrenador);

        const atletasAsignados = await fetchAtletas(coachData.id_entrenador);
        console.log('atletasAsignados:', atletasAsignados);
        setAtletas(atletasAsignados);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    cargarAtletas();
  }, []);

  const toggleSeleccion = (id_atleta: number) => {
    setSeleccionados((prev) =>
      prev.includes(id_atleta)
        ? prev.filter((id) => id !== id_atleta)
        : [...prev, id_atleta]
    );
  };

  const handleAsignar = async () => {
    if (seleccionados.length === 0) {
      Alert.alert('Selecciona al menos un atleta');
      return;
    }
    if (!id) {
      Alert.alert('Error', 'ID de entrenamiento inválido');
      return;
    }

    try {
      setLoading(true);
      const payload = seleccionados.map(id_atleta => ({
        id_entrenamiento: Number(id),
        id_atleta,
      }));

      await Promise.all(payload.map(async (asignacion) => {
        const res = await fetch(`${BASE_URL}/coaches/asignaciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(asignacion),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || 'Error al asignar entrenamiento');
        }
      }));

      Alert.alert('Éxito', `Entrenamiento asignado a ${seleccionados.length} atleta(s)`);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Asignar entrenamiento</Text>

      <Text style={styles.label}>Selecciona atletas:</Text>
      {atletas.length === 0 ? (
        <Text>No tienes atletas asignados</Text>
      ) : (
        atletas.map((atleta) => (
          <TouchableOpacity
            key={atleta.id_atleta}
            style={[
              styles.atletaItem,
              seleccionados.includes(atleta.id_atleta) && styles.selected,
            ]}
            onPress={() => toggleSeleccion(atleta.id_atleta)}
          >
            <Text style={styles.atletaNombre}>{atleta.nombre_completo}</Text>
          </TouchableOpacity>
        ))
      )}

      <Button title="Asignar entrenamiento" color="#4CAF50" onPress={handleAsignar} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    gap: 10,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  atletaItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  selected: {
    backgroundColor: '#D0F0C0',
    borderColor: '#4CAF50',
  },
  atletaNombre: {
    fontSize: 16,
  },
});
