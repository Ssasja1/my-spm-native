import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getWorkoutById } from '../../api';
import { MaterialIcons } from '@expo/vector-icons';

// ✅ Tipo explícito para Workout
interface Workout {
  id_entrenamiento: number;
  titulo: string;
  descripcion: string;
  duracion_estimada: number;
  nivel_dificultad: string;
}

export default function VerDetallesEntrenamiento() {
  const { id } = useLocalSearchParams();
  const [workout, setWorkout] = useState<Workout | null>(null); // ✅ tipo correcto
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const data = await getWorkoutById(Number(id));
        setWorkout(data);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          Alert.alert('Error', err.message);
        } else {
          Alert.alert('Error', 'Ocurrió un error desconocido');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWorkout();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando entrenamiento...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar el entrenamiento.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="fitness-center" size={64} color="#4CAF50" />
        </View>
        <Text style={styles.title}>{workout.titulo}</Text>
        <View style={styles.separator} />

        <Text style={styles.label}>Descripción:</Text>
        <Text style={styles.detail}>{workout.descripcion}</Text>

        <Text style={styles.label}>Duración estimada:</Text>
        <Text style={styles.detail}>{workout.duracion_estimada} minutos</Text>

        <Text style={styles.label}>Nivel de dificultad:</Text>
        <Text style={styles.detail}>{workout.nivel_dificultad}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
  },
  detail: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});
