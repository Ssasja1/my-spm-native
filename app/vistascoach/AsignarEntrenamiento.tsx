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
import { getWorkoutById } from '../../api';

//interfaz generica que me dio chat xd para que la chequen

interface Atleta {
  id: number;
  nombre: string;
}

export default function AsignarEntrenamiento() {
  const { id } = useLocalSearchParams(); // ID del entrenamiento
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workout = await getWorkoutById(Number(id));
        setWorkoutTitle(workout.titulo);

        // Mock de atletas (reemplaza con tu API)
        const fakeAtletas = [
          { id: 1, nombre: 'Ana López' },
          { id: 2, nombre: 'Carlos Ramírez' },
          { id: 3, nombre: 'Luisa Méndez' },
        ];
        setAtletas(fakeAtletas);
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

    fetchData();
  }, [id]);

  const toggleSeleccion = (idAtleta: number) => {
    setSeleccionados((prev) =>
      prev.includes(idAtleta)
        ? prev.filter((id) => id !== idAtleta)
        : [...prev, idAtleta]
    );
  };

  const handleAsignar = () => {
    if (seleccionados.length === 0) {
      Alert.alert('Selecciona al menos un atleta');
      return;
    }

    // Aquí iría la llamada a la API para asignar el entrenamiento
    Alert.alert(
      'Asignado',
      `Entrenamiento "${workoutTitle}" asignado a ${seleccionados.length} atleta(s)`
    );
    router.back();
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
      <Text style={styles.subheading}>Entrenamiento: {workoutTitle}</Text>

      <Text style={styles.label}>Selecciona atletas:</Text>
      {atletas.map((atleta) => (
        <TouchableOpacity
          key={atleta.id}
          style={[
            styles.atletaItem,
            seleccionados.includes(atleta.id) && styles.selected,
          ]}
          onPress={() => toggleSeleccion(atleta.id)}
        >
          <Text style={styles.atletaNombre}>{atleta.nombre}</Text>
        </TouchableOpacity>
      ))}

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
  subheading: {
    fontSize: 16,
    marginBottom: 15,
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
