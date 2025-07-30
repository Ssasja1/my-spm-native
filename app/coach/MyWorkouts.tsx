import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getCoachById, getWorkoutsByCoach } from '../../api';

// ✅ Interfaz definida
interface Workout {
  id_entrenamiento: number;
  titulo: string;
  descripcion?: string;
  duracion_estimada?: number;
  nivel_dificultad?: string;
}

export default function WorkoutsTab() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const id_usuario = await AsyncStorage.getItem('user_id');
        if (!id_usuario) throw new Error('ID del usuario no encontrado');

        const coach = await getCoachById(id_usuario);
        const id_entrenador = coach.id_entrenador;

        const data = await getWorkoutsByCoach(id_entrenador);
        setWorkouts(data);
      } catch (err) {
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

    fetchWorkouts();
  }, []);

  const handleOptions = (workout: Workout) => {
    Alert.alert(
      'Opciones',
      `Acciones para: ${workout.titulo}`,
      [
        {
          text: 'Editar',
          onPress: () =>
            router.push({
              pathname: '/vistascoach/EditarEntrenamiento',
              params: { id: workout.id_entrenamiento },
            }),
        },
        {
          text: 'Asignar a atletas',
          onPress: () =>
            router.push({
              pathname: '/vistascoach/AsignarEntrenamiento',
              params: { id: workout.id_entrenamiento },
            }),
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/vistascoach/VerDetallesEntrenamiento',
          params: { id: item.id_entrenamiento },
        })
      }
    >
      <View style={styles.cardLeft}>
        <MaterialIcons name="fitness-center" size={24} color="black" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.subtitle}>
          Duración: {item.duracion_estimada ?? 'N/A'} min | Dificultad: {item.nivel_dificultad ?? 'N/A'}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleOptions(item)} style={styles.menuIcon}>
        <MaterialIcons name="more-vert" size={24} color="gray" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Cargando entrenamientos...</Text>
      </View>
    );
  }

  if (!workouts.length) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="fitness-center" size={48} color="#4CAF50" />
        <Text style={styles.emptyText}>No hay entrenamientos creados aún</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={workouts}
      keyExtractor={(item) => item.id_entrenamiento.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}


const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
  },
  list: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    elevation: 2,
  },
  cardLeft: {
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuIcon: {
    paddingLeft: 10,
  },
});
