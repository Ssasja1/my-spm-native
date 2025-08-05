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

interface Workout {
  id_entrenamiento: number;
  titulo: string;
  descripcion: string;
  duracion_estimada: number;
  nivel_dificultad: string;
}

export default function VerDetallesEntrenamiento() {
  const { id } = useLocalSearchParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
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
        <ActivityIndicator size="large" color="#FF6B00" />
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
      <View style={styles.header}>
        <Text style={styles.mainTitle}>ENTRENAMIENTO SPM</Text>
        <Text style={styles.subtitle}>CADA DATO TE ACERCA A LA GRANDEZA</Text>
        <View style={styles.divider} />
      </View>
      
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="fitness-center" size={64} color="#FF6B00" />
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
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF6B00',
    textAlign: 'center',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#FF6B00',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#252525ff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#f1f1f1',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  separator: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B00',
    marginTop: 10,
    fontFamily: 'monospace',
  },
  detail: {
    fontSize: 16,
    color: '#c3c3c3',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f1f1f1',
    fontFamily: 'monospace',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B00',
    fontFamily: 'monospace',
  },
});