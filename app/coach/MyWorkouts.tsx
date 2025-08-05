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
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getCoachById, getWorkoutsByCoach } from '../../api';

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

  const fetchWorkouts = async () => {
    try {
      setLoading(true); // Mostrar loader durante refresh
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

  useEffect(() => {
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
        <MaterialIcons name="fitness-center" size={24} color="#FF6B00" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.subtitle}>
          Duración: {item.duracion_estimada ?? 'N/A'} min | Dificultad: {item.nivel_dificultad ?? 'N/A'}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleOptions(item)} style={styles.menuIcon}>
        <MaterialIcons name="more-vert" size={24} color="#a3a3a3" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Cargando entrenamientos...</Text>
      </View>
    );
  }

  if (!workouts.length) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="fitness-center" size={48} color="#FF6B00" />
        <Text style={styles.emptyText}>No hay entrenamientos creados aún</Text>
        <TouchableOpacity onPress={fetchWorkouts} style={styles.refreshButton}>
          <MaterialCommunityIcons name="reload" size={22} color="#FF6B00" />
          <Text style={styles.refreshText}>Actualizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>SPM</Text>
        <Text style={styles.headerSubtitle}>CADA DATO TE ACERCA A LA GRANDEZA</Text>
        <View style={styles.divider} />

        <TouchableOpacity onPress={fetchWorkouts} style={styles.refreshButton}>
          <MaterialCommunityIcons name="reload" size={22} color="#FF6B00" />
          <Text style={styles.refreshText}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id_entrenamiento.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
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
  headerSubtitle: {
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    color: '#f1f1f1',
    marginTop: 10,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    color: '#f1f1f1',
    fontFamily: 'monospace',
  },
  refreshButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshText: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  list: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopColor: '#333333',
    borderLeftColor: '#333333',
    borderRightColor: '#333333',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B00',
    borderRadius: 4,
    padding: 14,
    marginBottom: 12,
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
    color: '#f1f1f1',
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    fontFamily: 'monospace',
  },
  menuIcon: {
    paddingLeft: 10,
  },
});
